#!/bin/bash

# Local .env
if [ -f .env ]; then
    # Load Environment Variables
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
    # For instance, will be example_kaggle_key
fi

echo $PAGE

# arquivo de exemplo para iniciar o container
export SOURCE_DIR='/home/jordan/soma-chatbot-homol'
export DATA_DIR='/tmp/soma-chatbot-homol/data/'

# confira o seu ip usando ifconfig docker0|grep 'inet addr:'
export DOCKER_LAN_IP=$(ifconfig docker0 | grep 'inet addr:' | awk '{ split($2,a,":"); print a[2] }')

# porta que sera feito o bind


docker run --name $CONTAINER_NAME \
 -v $SOURCE_DIR:/src -v $DATA_DR:/data \
 -p $DOCKER_LAN_IP:$PORT:$PORT \
 --cpu-shares=512 \
 --memory 1800m -dit --restart unless-stopped $IMAGE_NAME
