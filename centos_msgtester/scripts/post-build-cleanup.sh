#!/bin/bash
set -e

printf "\n[-] Performing final cleanup...\n\n"

# get out of the src dir, so we can delete it
cd $APP_BUNDLE_DIR

# Clean out docs
rm -rf /usr/share/{doc,doc-base,man,locale,zoneinfo}

# Clean out package management dirs
rm -rf /var/lib/{cache,log}

printf "\n[-] calling rm -rf ${APP_SOURCE_DIR}...\n\n"
# remove app source
rm -rf $APP_SOURCE_DIR

# remove meteor
rm -rf /usr/local/bin/meteor
rm -rf /root/.meteor

# clean additional files created outside the source tree
rm -rf /root/{.npm,.cache,.config,.cordova,.local}
rm -rf /tmp/*

# remove npm
rm -rf /opt/nodejs/bin/npm
rm -rf /opt/nodejs/lib/node_modules/npm/

# remove os dependencies
printf "\n[-] calling yum clean all...\n\n"
yum clean all
printf "\n[-] rm cache...\n\n"
rm -rf /var/cache/yum
