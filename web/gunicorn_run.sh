#!/bin/sh
cd server; gunicorn --bind 0.0.0.0:5000 lida_app:LidaApp
