#!/bin/bash

set -e

if [ -f $APP_SOURCE_DIR/launchpad.conf ]; then
  source <(grep NODE_VERSION $APP_SOURCE_DIR/launchpad.conf)
fi

printf "\n[-] Installing latest Node version 8 ...\n\n"

curl --fail -sSL -o setup-nodejs https://rpm.nodesource.com/setup_8.x
bash setup-nodejs
yum install -y nodejs gcc-c++ make

#ln -sf /opt/nodejs/bin/node /usr/bin/node
#ln -sf /opt/nodejs/bin/npm /usr/bin/npm
