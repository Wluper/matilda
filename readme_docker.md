# Overview

You can edit the `/docker-compose.yml` file according to your needs; you might not need a containerized 
mongoDB database, if you are using one on your machine or remotely.

You can also configure your installation by edting `/configuration/conf.json` and `/configuration/gunicorn_run.sh`.

# Document Structure

1. <strong>Requirements</strong>
   - 64bit
   - Docker and docker-compose
2. <strong>How to run MATILDA</strong>
3. <strong>Installation</strong>
4. <strong>Stopping and rebooting MATILDA</strong>
5. <strong>HTTPS Support</strong><br>
   - SSL certificate
   - Improving security
7. <strong>Backup, restore, share the database</strong>
8. <strong>OS specific suggestions</strong>

# Requirements

## Hardware
In order to run MATILDA on Docker you will need a 64bit system because that's the minimum requirements for Docker.
The server needs 60MB on the hard disk, plus the space needed by the database.

MATILDA with Docker successfully run on a system based on the Intel Celeron J3355, a 2-core microprocessor dated 2016 created for entry level PCs, with a 2GB RAM. During a significant processing peak induced with an upload the footprint did not exceed a few (2-3%) percent of hardware capacity.

## Docker and docker-compose
You can install Docker by following the instructions on <a href="https://docs.docker.com/get-docker/">Docker documentation</a>.

<strong>The next paragraphs are assuming you have docker and docker-compose installed.</strong>

# How to run Matilda server

This HOWTO refers to installing the Matilda inter-annotation service on a generic host, not dependent on the Operating System, provided it supports the *git* command and the Docker toolset. Both the *docker* and *docker-compose* commands must be available. See OS specific suggestions below.

## Installation

Using the *git* command, clone this repository (or download and uncompress the zipfile), and enter the *matilda* directory.

    $ git clone https://github.com/davivcu/matilda
    $ cd matilda
    $ sudo docker-compose up -d

## Stopping the service

Unless you manually stop the service for some reason, it will be automatically started at the next boot. 

To manually stop the service use the command:

    $ sudo docker-compose kill

If you manually stop the service, you need to restart it before shutting down the server in order to auto-start it at boot.

To have an instant check of system state use `docker-compose ps`:

    $ sudo docker-compose ps
    Name                 Command                         State   Ports
    ------------------------------------------------------------------
    matilda_1      ./gunicorn_run.sh                Up           
    mongodb_1   docker-entrypoint.sh mongod         Up           
    nginx_1     /docker-entrypoint.sh ngin ...      Up           

What you see may change according to your OS or your MATILDA's and Docker's version.
For a more detailed view of the log use `docker-compose logs`.

On the first run, the server creates an administration account for you: the username is root, the password is *admin*. You are prevented from removing the *root* account, but you can change the password. This is strongly encouraged if you are not planning to use this service as a sandbox.

To access the service with your browser, use the URL `https://<address>` replacing *address* with the IP address or the hostname of the server (*localhost* included). You can use `http.//` as well, with reduced security.

# HTTPS Support

If you plan to use the security functionalities provided by HTTPS you can add nginx to MATILDA by replacing the *docker-composer.yml* file with *docker-composer_with_nginx.yml* contained in *nginx_conf*.

Docker version of MATILDA is not using nginx by default but it provides an alternative docker-compose.yml file
in /nginx_conf with nginx included. In order to use that configuration you might need to generate a self-signed
SSL certificate with the instructions in "HTTPS Support" paragraph.
If you already have a SSL certificate you can place it in /nginx_conf and ignore this paragraph.

## SSL Certificate

1) You can add nginx to MATILDA by replacing the *docker-composer.yml* file with *docker-composer_with_nginx.yml* contained in *nginx_conf*.
In that case you will also need to create a self-signed certificate: to do this, enter the *nginx_conf* directory and issue the following openssl command:

    $ cd nginx_conf
    $ openssl req -subj '/CN=localhost' -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365
    
which creates a self-signed certificate to encrypt client-server communication. This does not preclude a "men in the middle" attack, allowing an intruder to take the place of your server. However, this is a reasonable tradeoff between security and simplicity. The certificate must be renewed after one year with the same command.

2) Go back to the root and run Matilda with the new composition by the *docker-compose* command:

    $ cd ..
    $ sudo docker-compose up -d
    

## Improving security

Use a certificate provided by a Certification Authority (like [Letsencrypt](https://letsencrypt.org), which provides free certificates which must be renewed every 90 days) and copy it in the *nginx_conf* directory.

## Backup, restore, share the database

The two directories named *db* and *dbconfig* contain your database. To make a backup copy you can create a zip archive containing the two directories, using a timestamp in the filename. To restore the database, unzip the archive. In the same way the database can be shared with collaborators. **Always kill the service while performing such operations**.

# OS specific suggestions

## Ubuntu

The server has been tested with ubuntu 18.04 (Bionic Beaver). We advice using the snap distribution of the docker package, since the apt one gave us minor problems. Therefore after installing a bare minimal Ubuntu, install the needed software with:

    # sudo apt update
    # sudo apt upgrade
    # sudo apt install docker.io
    # sudo apt install docker-compose
   
