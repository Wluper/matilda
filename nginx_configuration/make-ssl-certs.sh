#!/bin/sh
CONFDIR="/etc/nginx/"
openssl req -subj '/CN=localhost' -x509 -newkey rsa:4096 -nodes -keyout $CONFDIR/key.pem -out $CONFDIR/cert.pem -days 365
