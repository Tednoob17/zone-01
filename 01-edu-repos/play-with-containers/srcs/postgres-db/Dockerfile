FROM debian:bullseye

RUN apt-get update && apt-get install -y postgresql-13 postgresql-contrib

USER postgres

RUN rm -rf /var/lib/postgresql/13/main

COPY tools/setup_db.sh /tmp/setup_db.sh


ENTRYPOINT [ "bash", "/tmp/setup_db.sh" ]
