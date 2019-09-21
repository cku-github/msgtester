#!/bin/bash

set -e

if [ -f $APP_SOURCE_DIR/launchpad.conf ]; then
  source <(grep INSTALL_MONGO $APP_SOURCE_DIR/launchpad.conf)
fi

if [ "$INSTALL_MONGO" = true ]; then
    printf "\n[-] Installing latest MongoDB ...\n\n"

    cp $BUILD_SCRIPTS_DIR/mongodb-org-4.2.repo /etc/yum.repos.d/mongodb-org-4.2.repo

    yum install -y mongodb-org
    yum clean all

    mkdir -p /data/{db,configdb}
    chown -R mongodb:mongodb /data/{db,configdb}
        rm -rf /var/lib/mongodb
    mv /etc/mongod.conf /etc/mongod.conf.orig
fi