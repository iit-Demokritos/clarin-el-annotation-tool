# The Ellogon Web Annotation Tool
## How to deploy the Annotation tool through docker-compose
The Ellogon Web Annotation Tool can be deployed as a container. A container image is available at [Docker Hub](https://hub.docker.com/r/petasis/ellogon-web-annotation-tool).
The steps to deploy the container through docker-compose/podman-compose or similar tools, are:
1. Clone this repository:  
    `git clone --recurse-submodules https://github.com/iit-Demokritos/clarin-el-annotation-tool.git`
2. Change directory to clarin-el-annotation-tool/docker:
    `cd clarin-el-annotation-tool/docker`
3. Inside the `docker` folder, copy the file `env-dist` to `env`:
    `cp env-dist env`
4. Edit file `env` to your needs, by adding passwords, the SMTP server, secret key, etc. Do not remove any variable definitions from it.
5. After the `env` file has been edited and saved, run the script `restart.sh`:
    `bash restart.sh`

Running this script will perform the following actions:
1. Check that the file `env` is available in the `docker` directory.
2. Read the variables defined in the `env` file in the shell.
3. Ensure that the variable `EMAIL_URL` has been defined in the `env` file.
4. Set the correct SELinux context in the folder.
5. Generate the file `conf/env`, which will be used by the container.
6. It will run `podman-compose`/`docker-compose` to start the containers.
7. It will wait for about 3 minutes.
8. It will initialise the two databases, MariaDB and Mongo.
