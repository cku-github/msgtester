#!/bin/bash

set -e

printf "\n[-] Installing Passenger ...\n\n"

PASSENGER_CONF=/etc/nginx/conf.d/passenger.conf

curl --fail -sSLo /etc/yum.repos.d/passenger.repo https://oss-binaries.phusionpassenger.com/yum/definitions/el-passenger.repo
yum install -y nginx passenger || yum-config-manager --enable cr && yum install -y nginx passenger

#edit passenger file as described on https://www.phusionpassenger.com/library/walkthroughs/deploy/meteor/ownserver/nginx/oss/el7/install_passenger.html
printf "\n[-] calling sed to remove comment flag in ${PASSENGER_CONF}\n\n"
# using sed with @ as delimiter as I want to find and replace values contains / 
sed -i "s/# passenger_root/passenger_root/" ${PASSENGER_CONF}
sed -i "s/# passenger_ruby/passenger_ruby/" ${PASSENGER_CONF}
sed -i "s/# passenger_instance_registry_dir/passenger_instance_registry_dir/" ${PASSENGER_CONF}
