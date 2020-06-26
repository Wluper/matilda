## How to build a Docker container

Building a docker container depends on a deployment script, the Dockerfile, which is already in place already in place. The Dockerfile uses the "requirements.txt" file to configure the server, and the "gunicorn_run.sg" script to launch the server.

To build a new docker, use the command:

$ sudo docker build -t flask/lida .

To run the docker, use the command:

$ sudo docker run -p 5000:5000 flask/lida

To push the container on a shared repository you need to first tag the container using your username on Dockerhub, next login, and finally push. Look on Google for precise instructions.
