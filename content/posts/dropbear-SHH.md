+++
date = '2025-11-10'
draft = false
title = 'Remote decryption using Dropbear SSH'
tags = ['Linux', 'Encryption', 'Remote Access']
preview_summary = "Guide on how to remotely decrypt machine using Dropbear SSH"
+++

## My first encounter with encryption

The first time i had encountered encryption was when i was installing Debian on a machine that was meant to be my first homelab. In the disk partitiong segment of the installation process I was presented with the option to use LUKS encryption on my drives. Since i had not yet dabbled with the idea, but found it cool, i decided to go with it and encrypt my drives.

Since i don't keep the homelab machine at my own place, I had to setup remote access to it right away. And in the process i realized - i cannot remotely decrypt my drives if the machine ever powers off. After that i scoured the web for solutions to my problem and in the end i landed on Dropbear SSH.

## What is Dropbear SHH and how does it apply to this use case

Dropbear SSH is a lightweigh SSH server and client that is primarily used on embedded systems with low memory and processor resources.

Most systems have some sort of pre-boot environment. This userspace is loaded into the RAM so that the kernel can load drivers and logic that's needed to mount the real root filesystem. The Linux kernel is shipped with the initramfs filesystem (or equivalent) by default.

Dropbear SHH can be leveraged to gain access to this pre-boot filesystem before the drives are mounted. This allows us to remotely decrypt the drives of our machine.

## Implementation

**NOTE** - This implementation walkthrough will be for Debian and Debian based systems, but the same principles still apply to others.

### Update and upgrade your machine

```
sudo apt update
sudo apt upgrade
```

### Install Dropbear

```
sudo apt install dropbear-initramfs
```

```
 sudo -i
 cd /etc/dropbear/initramfs/
```

Because these files affect the boot image, they live under /etc. Using `sudo -i` we can get a clean root environment that behaves as if we physically logged in as root.

### Configure dropbear.conf

Options:

- -I : Disconnect the session if no traffic is transmitted or received in x seconds

Auto-disconnecting inactive sessions reduces exposure in the early boot process.

- -j: Disable ssh local port forwarding.

- -k : Disable remote port forwarding.

Disabling port forwarding minimizes attack surface.

- -p : Dropbear listen on this specified TCP port.

I always use a non default port to avoid generic scaning noise.

- -s : Disable password logins.

Always disable password logins and use key pairs for authentication.

Example:

    DROPBEAR_OPTIONS="-I 239 -j -k -p 5768 -s"

### Set early-boot networking

Early boot networking needs to be set in order for Dropbear to accept SSH before userspace networking is up. This is done by injecting a static IPv4 configuration in the initramfs config file => /etc/initramfs-tools/initramfs.conf.

Format:

    IP=SERVER_IP::ROUTER_IP:NETMASK:SERVER_HOSTNAME

Example:

    IP=192.168.1.36::192.168.1.1:255.255.255.0:node2

## Update the initramfs

    sudo update-initramfs -u -v

This rebuilds the initramfs with the changes for the current kernel. This command must be run after every change to the initramfs config so that it takes affect at boot.

## Create the keys

#### Generate a new client key

    ssh-keygen -t rsa -f ~/.ssh/dropbear

#### Copy the key to the server:

    scp ~/.ssh/dropbear.pub marko@192.168.0.200:~/dropbear.pub

#### Add the key to the initramfs authorized keys:

    cat /home/marko/dropbear.pub >> /etc/dropbear/initramfs/authorized_keys

#### Stop being root

    exit

#### Update initramfs again

    sudo update-initramfs -u

## Making an alias (optional)

### Edit the bashrc on the client

    nano ~/.bashrc

### Add the alias

Format:

    alias <Aliasname>="ssh -i ~/.ssh/dropbear -p <port> -o 'HostKeyAlgorithms ssh-rsa' root@<SERVER_IP> 'echo -n <DRIVE_ENCRYPTION_PASSWORD> | cryptroot-unlock'"

Exemple:

    alias node2unlock="ssh -i ~/.ssh/dropbear -p 5768 -o 'HostKeyAlgorithms ssh-rsa' root@192.168.0.200 'echo -n test | cryptroot-unlock'"

### Source the bashrc:

    source .bashrc

### Reboot:

    sudo reboot now

### Try to unlock the server with your alias:

    node2unlock

## Manual unlock with no alias:

    ssh -i ~/.ssh/dropbear -p <port> -o "HostKeyAlgorithms ssh-rsa" root@<SERVER_IP>
    cryptroot-unlock
