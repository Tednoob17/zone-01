FROM debian:bullseye

RUN apt-get update && \
    apt-get install -y rabbitmq-server

RUN rabbitmq-plugins enable rabbitmq_management

EXPOSE 5672 15627

COPY tools/setup_rq.sh /tmp/setup_rq.sh

RUN chmod +x /tmp/setup_rq.sh

ENTRYPOINT [ "bash", "/tmp/setup_rq.sh" ]
