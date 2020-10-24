#!/bin/sh
python3 database_init.py
cd server; gunicorn --bind 0.0.0.0:5000 lida_app:LidaApp
