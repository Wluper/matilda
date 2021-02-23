#!/bin/sh
cd server; gunicorn --bind 0.0.0.0:5000 matilda_app:MatildaApp