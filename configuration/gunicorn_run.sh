#!/bin/sh
cd server; gunicorn --bind 0.0.0.0:5000 matilda_app:MatildaApp --log-file matilda.log --log-level 'info'
