#!/bin/bash

set -e

printf "\n[-] Installing base OS dependencies...\n\n"

# install base dependencies
printf "\n[-] calling yum update...\n\n"
yum update -y
printf "\n[-] calling yum install ...\n\n"
yum install -y epel-release yum-utils curl python git wget pygpgme
yum-config-manager --enable epel
printf "\n[-] calling yum clean all ...\n\n"
yum clean all
printf "\n[-] calling yum update ...\n\n"
yum update -y

# printf "\n[-] Installing GOSU...\n\n"
# Install gosu.  https://github.com/tianon/gosu
# gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4
# curl -o /usr/local/bin/gosu -SL "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64"
# curl -o /usr/local/bin/gosu.asc -SL "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-amd64.asc"
# gpg --verify /usr/local/bin/gosu.asc
# rm /usr/local/bin/gosu.asc
# rm -r /root/.gnupg/
# chmod +x /usr/local/bin/gosu
# Verify that the binary works
# gosu nobody true
