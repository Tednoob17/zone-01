#!/bin/bash

# install rabbitmq
apt-get update && \
    apt-get install -y rabbitmq-server && \
    rabbitmq-plugins enable rabbitmq_management

# start rabbitmq server
/etc/init.d/rabbitmq-server start

# create the rabbitmq user
rabbitmqctl add_user ${RABBITMQ_USER} ${RABBITMQ_PASSWORD} || echo ${RABBITMQ_USER} already exists 
rabbitmqctl set_user_tags ${RABBITMQ_USER} administrator
rabbitmqctl set_permissions -p / ${RABBITMQ_USER} ".*" ".*" ".*"
