#!/bin/bash

apt-get update && apt-get install -y \
    python3.10 python3-pip python3.10-venv \
    nodejs \
    npm

npm install pm2 -g
