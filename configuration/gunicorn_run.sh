#!/bin/sh
cd server; gunicorn --bind 0.0.0.0:8080 matilda_app:MatildaApp
