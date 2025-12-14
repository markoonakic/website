+++
date = '2025-12-14'
draft = false
title = 'List Available Azure Regions and VM Sizes for Your Subscription'
tags = ['Azure', 'Azure CLI', 'Azure Policy']
preview_summary = "Commands to list the Azure regions your subscription allows and the VM sizes deployable there"
+++

## Why I wrote this

I tried deploying my first infrastructure-as-code setup on Azure and immediately hit two blockers: a region restriction (403 `RequestDisallowedByAzure`) and a VM size availability error (409 `SkuNotAvailable`).
After a bunch of trial and error, I ended up with a simple workflow: first ask Azure which regions my subscription is allowed to deploy into, then list the VM sizes that are actually deployable in a region I pick.

## The 3 "region lists"

When people say "what regions are available", it’s usually one of these:

- Regions Azure has (global Azure footprint).
- Regions your subscription can _see_ (e.g., `az account list-locations`).
- Regions your subscription is _allowed to deploy into_ (Azure Policy allow-list).

In my case, the "allowed to deploy into" list was the only one that mattered, because a subscription-level policy was denying deployments outside an allow-list.
To fetch that allow-list reliably, I query the policy assignment by its resource ID via the Azure Policy REST "Get By Id" endpoint using `az rest`.

## The 2 failure modes (what broke)

- **403 `RequestDisallowedByAzure`**: you picked a region that your subscription policy blocks, so Azure denies resource creation there.
- **409 `SkuNotAvailable`**: even in an allowed region, the VM size you selected might not be available for your subscription/region right now, and the practical fix is to pick a different VM size or a different region.

This post is about preventing both by discovering "allowed regions" and "deployable VM sizes" _before_ you run `terraform apply`.

## What "SKU" means

A VM "SKU" is basically the VM size name you pick when creating a VM, like `Standard_B2s_v2`.
That string corresponds to a machine shape (vCPUs + memory, plus other capabilities), and Azure can restrict it per region and per subscription, which is why just because it exists doesn’t always mean you can deploy it there.

## Prereqs

- You need the Azure CLI installed and authenticated (`az login`).
- These commands are Bash-focused and write outputs into files, so you can read them however you like.

## Step 1: Set the subscription (once)

```bash
SUB="<SUBSCRIPTION_ID>"

(
  set -euo pipefail

  az account set --subscription "$SUB"
  az account show --query "{name:name,id:id,tenantId:tenantId}" -o jsonc
)
```

What each line does:

- `SUB="<SUBSCRIPTION_ID>"`
  - Stores your subscription ID once, so you don’t keep retyping it (and accidentally query the wrong subscription).
- `( ... )`
  - Runs everything inside a subshell, so shell options like `-u` don’t interfere with your interactive session after the block finishes (for example, they won’t kick you out of your DevPod if a plugin touches an unset variable).
- `set -euo pipefail`
  - `-e`: stop the script on the first command that fails.
  - `-u`: error if you use an unset variable (this prevents the classic "SUB is empty" bug).
  - `-o pipefail`: propagate failures through pipelines.
- `az account set --subscription "$SUB"`
  - Forces Azure CLI to operate on that subscription from here on.
- `az account show ... -o jsonc`
  - Prints a sanity-check blob showing which subscription/tenant you’re actually targeting.
  - `--query` uses Azure CLI’s built-in JMESPath querying and `-o jsonc` prints readable JSON.

**NOTE -** If you ever see an error like "InvalidSubscriptionId … 'providers'", it usually means your scope string got mangled because `SUB` was empty at the time you ran the command. (The `-u` flag is what prevents this.)

## Step 2: Get the allowed regions

This is the key idea: don’t guess regions, don’t rely on visible regions, just read the policy allow-list.

```bash
ASSIGN_ID=$(
  az policy assignment list \
    --scope "/subscriptions/$SUB" \
    --query "[?name=='sys.regionrestriction'].id | [0]" \
    -o tsv
)

echo "$ASSIGN_ID"
```

What each part does:

- `az policy assignment list --scope "/subscriptions/$SUB"`
  - Lists all policy assignments attached to your subscription scope.
- `--query "[?name=='sys.regionrestriction'].id | [0]"`
  - Filters for the `sys.regionrestriction` assignment and extracts its resource ID (if it exists).
- `-o tsv`
  - Outputs a plain string so Bash can store it cleanly.

Now fetch the actual allow-list via REST:

```bash
az rest --method get \
  --url "https://management.azure.com${ASSIGN_ID}?api-version=2023-04-01" \
  --query "properties.parameters.listOfAllowedLocations.value" \
  -o jsonc > allowed-regions.json

cat allowed-regions.json
```

What’s happening here:

- `az rest ...`
  - Calls the Azure Policy REST API endpoint that fetches a policy assignment by ID.
- `--query "properties.parameters.listOfAllowedLocations.value"`
  - Extracts the actual "allowed regions" list from the assignment parameters (this is the authoritative list you must follow).
- `> allowed-regions.json`
  - Saves it as JSON so it’s self-describing and easy to read.

Example output from my Azure for Students subscription:

```
[
  "spaincentral",
  "norwayeast",
  "francecentral",
  "italynorth",
  "switzerlandnorth"
]
```

**NOTE -** Some tenants use a different parameter name than `listOfAllowedLocations`. If your query returns nothing, dump `properties.parameters` and look for the actual key.

## Step 3: Pick one region and list deployable VM sizes

Once you pick a region from `allowed-regions.json`, you can generate a TSV file listing VM sizes plus vCPU/RAM.

```bash
REGION="francecentral"
SIZE_PREFIX="Standard_B"

{
  printf "SKU\tvCPUs\tMemoryGB\n"
  az vm list-skus \
    --location "$REGION" \
    --resource-type virtualMachines \
    --size "$SIZE_PREFIX" \
    --query "sort_by([].{sku:name,vCPUs:capabilities[?name=='vCPUs'].value | [0],memoryGB:capabilities[?name=='MemoryGB'].value | [0]}, &sku)" \
    -o tsv
} > "vm-skus-${REGION}.tsv"
```

Then view the start of the file:

```bash
sed -n '1,15p' "vm-skus-${REGION}.tsv"
```

What each piece does:

- `REGION="francecentral"`
  - This is the region you will deploy into (must be one of the allowed regions you discovered).
- `SIZE_PREFIX="Standard_B"`
  - Optional: filter to a VM family prefix to keep runtime and output smaller.
- `printf "SKU\tvCPUs\tMemoryGB\n"`
  - Adds a header row so the info has more context (TSV has no headers by default).
- `az vm list-skus --location "$REGION" --resource-type virtualMachines`
  - Lists VM SKUs for a region. Microsoft explicitly recommends `az vm list-skus` as part of troubleshooting `SkuNotAvailable`.
- `--size "$SIZE_PREFIX"`
  - Limits the list to SKUs matching that prefix (practical when `list-skus` is slow).
- `--query ...`
  - Extracts only what we care about: SKU name, vCPU count, memory in GB, then sorts by SKU.
- `> "vm-skus-${REGION}.tsv"`
  - Writes the output to a file you can open/search.

Example output (what you should see):

```
SKU     vCPUs   MemoryGB
Standard_B2s_v2 2       8
...
```

**NOTE - performance:** `az vm list-skus` can be slow (even when filtering), so don’t be surprised if it takes ~1–2 minutes.

## How I use this with Terraform

Before I touch Terraform, I pick:

- `REGION` from `allowed-regions.json`
- `VM size` from `vm-skus-${REGION}.tsv`

Then in Terraform I keep region as one variable and reuse it everywhere, so I don’t accidentally deploy a single resource into a blocked region.

## Troubleshooting

- If `allowed-regions.json` is empty:
  - Dump the full parameters and search for the actual allow-list key.
- If you still hit `SkuNotAvailable` even after selecting a size from the TSV:
  - Azure capacity can change, the documented mitigation is still "choose a different size or region," and regenerate the TSV.
- If the TSV looks "broken" when pasted into chat:
  - That’s tabs/wrapping. Open the file directly in Vim or print it with `sed` like above.
