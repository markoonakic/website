+++
date = '2025-11-24'
draft = false
title = 'Installing Talos Linux'
tags = ['Talos', 'Kubernetes', 'Homelab']
preview_summary = "Instructions for the installation of Talos Linux"
+++

# What is Talos?

Talos Linux is an open‑source Linux distribution built specifically to run Kubernetes.
The OS is immutable, and is managed via a declarative API which is protected with mutual TLS and role‑based access control.
It does not have an interactive shell nor does it support SSH, which greatly reduces the surface area for attacks.
The whole OS is defined as infrastructure-as-code, which makes it easily reproducible and minimizes configuration drift.

# Installation

## Flashing the ISO

The first step is grabbing the right ISO for your machine from [here](https://github.com/siderolabs/talos/releases). Then flash the ISO and boot into the installation medium.

At this point after the OS has booted Talos will be in **maintenance mode**.

While Talos is in maintenance mode it is important to run all `talosctl` commands with the `--insecure` flag.
Once we apply the configuration and the OS is installed properly Talos will stop accepting the `--insecure` flag and we will authenticate using the `talosconfig` file.

Now write down or remember the IP address of the Talos machine, which is displayed in the dashboard.

## Inspecting the disks

Ensure `talosctl` is installed on your laptop (and ideally matches the ISO version).

In a terminal on your laptop (or any other computer on the same network as the Talos machine) we need to run a command that will show us the drives available to the Talos machine.

We can do this using a helper variable for convenience:

```
NODE_IP=192.168.221.143   # Your talos machine IP here
```

List disks:

```
talosctl get disks -n "$NODE_IP" --insecure
```

## Generate config with the right install disk

Now once you have listed your disks you will need to select the one you want Talos to be installed to.

Helper variable for convenience:

```
INSTALL_DISK=/dev/sda   # Replace with disk you decided on
```

Generate config:

Keep in mind this command will generate `controlplane.yaml`, `worker.yaml` and `talosconfig` in your current working directory.

```
talosctl gen config CLUSTER_NAME https://$NODE_IP:6443 \
  --install-disk "$INSTALL_DISK"
```

The `--install-disk` flag baked the disk you selected into the generated `controlplane.yaml` and `worker.yaml`.

You can replace `CLUSTER_NAME` with any cluster name you like.

## Enable workloads on the control plane

**NOTE** - This step is optional, intended for clusters with a low number of nodes.

Open `controlplane.yaml` and in the `cluster:` section add:

```
cluster:
  allowSchedulingOnControlPlanes: true
```

This will allow pods to run on the control-plane node.

## Apply the config

From the directory where `controlplane.yaml` and `talosconfig` were generated, run:

```
talosctl apply-config --insecure \
  --nodes "$NODE_IP" \
  --file controlplane.yaml
```

The `apply-config` command sends your config to the ISO-booted node and instructs it to install Talos to the configured disk.

**What you should see on the node**:

Logs of the image being written to the disk you defined in `controlplane.yaml`.

At some point the screen will turn black, and the system will reboot.
Wait until Talos finishes booting and displays the dashboard again.

Note down the IP to be used as `NODE_IP` (it may be the same as before, but confirm to be safe).

## Point `talosctl` at this node using `talosconfig`

Now that the node is running from the disk with the keys we generated, stop using `--insecure` and instead use the `talosconfig` file that was created using `gen config`.

From the same directory, run:

```
talosctl --talosconfig=./talosconfig config endpoint "$NODE_IP"
```

```
talosctl --talosconfig=./talosconfig config node "$NODE_IP"
```

This writes our nodes IP to the `endpoint` and `node` values, so that future `talosctl` calls know where to connect.

You can check the connectivity by running:

```
talosctl --talosconfig=./talosconfig version
```

and

```
talosctl --talosconfig=./talosconfig service kubelet
```

## Bootstrap Kubernetes

Now we need to bootstrap the Kubernetes control plane (etcd, API server, etcd membership).

To bootstrap, run:

```
talosctl bootstrap \
  --nodes "$NODE_IP" \
  --endpoints "$NODE_IP" \
  --talosconfig=./talosconfig
```

This command is run **once for the whole cluster**, against **one control-plane node**.
Running it multiple times can break etcd.

It may take a while. If you get some transient TLS or connection error, just wait 30s and retry as the API finishes starting.

## Fetch `kubeconfig` and verify the cluster

Once the bootstrap succeeds, grab `kubeconfig` so you can use `kubectl`:

```
talosctl kubeconfig \
  --nodes "$NODE_IP" \
  --endpoints "$NODE_IP" \
  --talosconfig=./talosconfig \
  kubeconfig
```

This will write a file called `kubeconfig` in the current working directory.

After that:

```
export KUBECONFIG=$PWD/kubeconfig
```

```
kubectl get nodes
```

After running this you should see your single node in the `Ready` state, typically with a name derived from your config.

If you set `allowSchedulingOnControlPlanes:true`, it will be scheduled for workloads.

**Congratulations!!!**

At this point you should have your Talos cluster up and running!

If you are currently setting up your homelab, i now recommend you going with a **GitOps** deployment strategy.

The two main tools for this are **Flux CD** and **Argo CD**.

For a simple enough homelab I recommend going with **Flux CD**.
It is lightweight and similar to vanilla Kubernetes.
