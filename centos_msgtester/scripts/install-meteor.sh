#!/bin/bash

set -e

printf "\n[-] Installing the latest version of Meteor...\n\n"
curl -v https://install.meteor.com/ | sh