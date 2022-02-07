#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

if [ ! -f "${SCRIPT_DIR}/env" ]; then
  echo "File does not exist: ${SCRIPT_DIR}/env" 1>&2
  echo "Please copy file \"${SCRIPT_DIR}/env-dist\" to \"${SCRIPT_DIR}/env\", and modify it accordingly!" 1>&2
  exit 1
fi

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
