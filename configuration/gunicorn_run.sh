#!/bin/sh
cd server; gunicorn --bind 0.0.0.0:5000 matilda_app:MatildaApp --log-file gunicorn_logs.log --log-level 'info'
