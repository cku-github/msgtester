#!/bin/bash

set -e

# Set a delay to wait to start the Node process
echo "Delaying startup for 10 seconds..."
sleep 10

# starting passenger to listen on all local IP addresses
echo "=> Starting passenger on port $PORT..."
printf "\n[-] %s" $(passenger start --address 0.0.0.0)