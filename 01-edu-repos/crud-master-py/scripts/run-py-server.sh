#!/bin/bash

# change directory
echo "Switch directory: " $APP_PATH
cd $APP_PATH

# install packages
rm -rf
python3 -m venv venv
source ./venv/bin/activate

pip install --no-cache-dir -r requirements.txt

# run server
pm2 start server.py
