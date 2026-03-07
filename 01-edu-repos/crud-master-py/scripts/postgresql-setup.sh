#!/bin/bash

# install postgresql
apt-get update && apt-get install -y postgresql-14 postgresql-contrib

# stop postgresql
/etc/init.d/postgresql stop

# Clear the DB to make it ready for setup
rm -rf /var/lib/postgresql/14/main

# Init the database
mkdir /var/lib/postgresql/14/main
chown postgres:postgres /var/lib/postgresql/14/main
cd /var/lib/postgresql/14/main

su -c '/usr/lib/postgresql/14/bin/initdb -D /var/lib/postgresql/14/main/' -s /bin/sh postgres

# Enable public access
echo "listen_addresses='*'" >> /var/lib/postgresql/14/main/postgresql.conf

# Enable public access
echo "host  all  all 0.0.0.0/0 md5" >> /var/lib/postgresql/14/main/pg_hba.conf

# run postgresql server
su -c 'nohup /usr/lib/postgresql/14/bin/pg_ctl -D /var/lib/postgresql/14/main -l logfile start'

/etc/init.d/postgresql start

# setup the database
sudo -u postgres -H -- psql -d postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres -H -- psql -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
