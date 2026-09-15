#!/bin/bash

# Create user and enable to access RabbitMQ remotely
/etc/init.d/rabbitmq-server start

rabbitmqctl add_user ${RABBITMQ_USER} ${RABBITMQ_PASSWORD} && \
rabbitmqctl set_user_tags ${RABBITMQ_USER} administrator && \
rabbitmqctl set_permissions -p / ${RABBITMQ_USER} ".*" ".*" ".*"

/etc/init.d/rabbitmq-server stop

# start RabbitMQ server
rabbitmq-server
