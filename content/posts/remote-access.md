+++
date = '2025-12-07'
draft = false
title = 'Remote Access Architecture of My Kubernetes Homelab'
tags = ['Remote Access', 'Kubernetes', 'Homelab']
preview_summary = "Detailed explanation of how I remotely access my Kubernetes Cluster"
+++

## Why configure remote homelab access?

I think the concept of remotely accessing my homelab is really cool.
Think about it - you can be anywhere in the world, and all you would need to connect to your homelab is an internet connection.
So you take some machines, place them somewhere physically in the world, configure your choice of software on it, and then you can go anywhere knowing you're just a click away from accessing those same machines from a device of your choosing.

Not only is it cool, but it is incredibly useful too.

- Access all the services you normally self-host at home from anywhere.

- Tinker with your server whenever you want.

- Do some remote debugging.

In essence, you can do whatever you want with you server or other devices in your network, from anywhere!

## My experience with remotely accessing my homelab

The first homelab I had was running Debian server and I ran services within Docker containers.

I gained remote access by running a Wireguard VPN service inside my homelab, which allowed me to securely connect trough and encrypted tunnel.
This solution was simple and effective, without many layers to it.
I just created a docker-compose file, ran the container, forwarded the ports, and then it didn't work because I hadn't set up the networking properly :).
After learning a lot about networking and how everything works, this solution served me well for a while.

However, I realized the limitations this kind of setup brings.
There were no fancy UIs, all the connections were key-pair based, so it was a bit of a hassle to manage.
I never really set up any kind of controller so all of my services were just exposed by IP and port to my whole local network, not quite the optimal setup, but I gained a lot of knowledge and experience doing it.

Fast-forward, the time had come for some renovation.
My Debian setup had served me well, and it was time to move on to something more advanced.

In comes Talos Linux, the distribution built to run Kubernetes.
With this transition many more layers were added, which greatly complicated the infrastructure setup.

I first needed to decide on what solution to use this time.
I had been reading a lot about the Tailscale protocol and I really liked the concept.
But with Tailscale I would have to go through their servers in order to establish a connection.
This would violate the self-imposed constraints I had adhered by since first setting up my homelab.
I had strongly avoided routing my traffic through any external services, the goal was to keep as much independence and privacy as possible.

But then I ran across a project called Headscale.
An open source, self-hosted implementation of the Tailscale control server.
This would allow me to self-host my own server side for the implementation of the Tailscale protocol.
That's when I decided that was the solution I would go with.

## Mapping out how Headscale should be implemented

At first, I was oblivious to the amount of layers and complications the Talos + Kubernetes setup would bring.

I knew I would need an ingress controller, for that I had already decided I would use Traefik.

Then I realized that I can't just forward traffic from my router to a single machines IP address, since now I had a multi node cluster, and I couldn't know which node Headscale or any other service would be running on.

There was the option of hard-coding services to run on specific nodes, but I didn't like that idea as I wanted a flexible and scalable setup.

That's when I found out I needed a load balancer implementation, so that I can assign real IP addresses from the main network to the services living in the cluster.

The idea then was to route the traffic from the router to Traefik using the MetalLB load balancer.

After reading some more documentation, I found out I needed a domain and a properly signed certificate in order for Headscale to work. That was fine, since I had already planned to have specific subdomains for all my services, that were encrypted via HTTPS.

I figured I can obtain certificates via Let's encrypt, using an ACME challenge like HTTP‑01 or DNS‑01.

Then I realized that the manual managing of these certificates and secrets would be quite a hassle, and that's when I found out about the Kubernetes Reflector.

Reflector is a controller that can automatically replicate Kubernetes secrets and ConfigMaps across namespaces.
I decided to use it in order to sync the wildcard certificate secret with other namespaces, so that every ingress can reference the same cert by default.

There were also some attempts at setting up Pi-hole.
I tried setting up a local DNS server in order for all my services to be accessible only through the Tailscale network, to avoid having to expose all me services externally.

This idea was later scrapped when I found out Headscale already has a build in DNS system called MagicDNS. This is then what I used instead of Pi-hole.

Of course, all of these decisions and conclusions did not come out of thin air, but were the result of continuous trial, error, and research.
In the end I wound up with a setup I truly felt was good enough, at least for now :).

## The architecture of my current setup

<img src="/diagrams/remote-access-architecture.excalidraw.svg">

This diagram shows how everything connects together, from the internet all the way down to the pods running in my cluster.

Let me walk you through what happens when I try to access a service like Grafana from my laptop while I'm connected to the VPN.

## How VPN access works

When I open `https://grafana.sarma.love` in my browser, this is what happens:

First in line is **MagicDNS**.
Instead of having to remember IP addresses, I can just use domain names. MagicDNS resolves `grafana.sarma.love` to the MetalLB load balancer IP: `192.168.0.220`.

The request then travels through the VPN tunnel to my **Tailscale subnet router** pod running in the cluster.
This router is what allows VPN clients to access the entire `192.168.0.0/24` home network, which means I can reach both the Kubernetes services and use `kubectl`/`talosctl` to manage the cluster directly.

The subnet router advertises this route to the **Headscale control server**, which then tells all connected clients they can reach my home network through this router.

Once the traffic hits `192.168.0.220`, **MetalLB** forwards it to the **Traefik service**.
MetalLB is what makes this whole multi-node setup possible because it assigns a real IP address from my home network to Kubernetes services.
Without it, I'd have to either pin services to specific nodes or use NodePorts, both of which would just be quite unsustainable.

Traefik then looks at the HTTP Host header (`grafana.sarma.love`) and matches it against all the Ingress resources in the cluster.
It finds the Grafana ingress, sees that it needs the TLS certificate, and uses the wildcard certificate that was synced to the monitoring namespace by Reflector.

Finally, Traefik routes the request to the actual **Grafana pod**, and I get see my dashboard.

The complete VPN access flow:

**VPN client → Subnet router → 192.168.0.220 (MetalLB) → Traefik → Grafana**

## The role of DERP

There's one more piece worth mentioning and that's the DERP relay server.

DERP stands for Designated Encrypted Relay for Packets.
It's Tailscale's fallback mechanism when direct peer-to-peer connections aren't possible.
Most of the time, Tailscale establishes direct encrypted connections between devices.
But sometimes, due to restrictive firewalls or complex NAT situations, direct connections fail.

That's where DERP comes in.
If I'm on a restricted network that blocks direct VPN traffic, my connection can be relayed through another device in the mesh network that does have connectivity, or through my self-hosted DERP server running on port 3478. It adds a bit of latency, but it ensures I can always reach my homelab, no matter what network I'm on.

## Why this setup beats plain Wireguard

Compared to my old Wireguard setup, this has a few major advantages:

**MagicDNS** means I don't have to remember IP addresses or maintain a local DNS server. Services can be accessed via clean domain names.

**Headplane UI** gives me a nice web interface to manage devices, approve routes, and see who's connected. With Wireguard, it was all done in the CLI using config files (I know there are some Wireguard UIs, but i never got around to trying them out).

**ACL policies** in Headscale let me control which devices can access which services. The old setup just gave full network access to everything.

**Automatic key management** - Headscale handles the key exchange and rotation.
No more manually distributing WireGuard keys.

**The Kubernetes abstraction** means services can move between nodes, restart, or scale, and everything keeps working because MetalLB and Traefik handle the routing automatically.

## Wrapping up

Setting this up was definitely a one of the harder quests I gave myself. There were moments where I had five browser tabs of documentation open while hopping around 4 tmux panes full of logs trying to figure out why MagicDNS wasn't resolving, or why cert-manager kept failing the ACME challenge.

But now that I got it running, it just works.
I can open my laptop anywhere, connect to the VPN, and access my homelab like I'm sitting at home.
All my services have proper HTTPS certificates, nice domain names, and everything is defined in Git thanks to Flux.

Is it overkill for a homelab? Depends on who you ask. But I learned more setting this up than I would have from any tutorial or course. And honestly, there's something really satisfying about knowing every layer of your own infrastructure, from the router port forwards all the way down to the pods.

If you're thinking about building something similar, go step by step. Get Headscale working first, add Traefik, then layer in the other pieces as you need them. Don't try to deploy everything at once like I did... or do - if you read the article you have much more context than I did when I went into this blindly :).

**Hope you found something here helpful, and I wish you good luck in whatever your pursuit!**

P.S. Once I got a grasp of the architecture, I went with setting things up exactly as in the diagram, from the Internet to the pods.
