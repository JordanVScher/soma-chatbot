#!/bin/bash

# Local .env
if [ -f .env ]; then
    # Load Environment Variables
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi


docker build \
-t $IMAGE_NAME \
--build-arg EXPORT_PORT=${PORT} \
.
