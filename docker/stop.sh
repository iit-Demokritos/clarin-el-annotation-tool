#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# . ${SCRIPT_DIR}/env
set -o allexport
source  ${SCRIPT_DIR}/env
set +o allexport

cd $SCRIPT_DIR/..

if command -v podman-compose &> /dev/null; then
    export DOCKER_COMPOSE=podman-compose
else
    export DOCKER_COMPOSE=docker-compose
fi

${DOCKER_COMPOSE} --project-name ${PROJECT_NAME} \
	          -f docker/docker-compose.yml \
                  down
