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

## Make sure submodules have been initialised:
cd $SCRIPT_DIR/..
if command -v git &> /dev/null
then
    git submodule update --remote --init
else
    echo "git is not available. Please make sure submodules have been initialised!"
fi

## If npm is available, download the frontend packages...
if [ ! -d "$SCRIPT_DIR/../clarin-angular/node_modules" ] && command -v npm &> /dev/null
then
    cd $SCRIPT_DIR/../clarin-angular
    npm install --legacy-peer-deps --yes
fi

cd $SCRIPT_DIR/..

if command -v selinuxenabled &> /dev/null; then
  selinuxenabled
  if [ $? -ne 0 ]; then 
    echo "SELinux DISABLED!"
  else
    echo "SELInix ENABLED!"
    if command -v chcon &> /dev/null
    then
        chcon -Rt svirt_sandbox_file_t .
    fi
    
    if command -v setsebool &> /dev/null
    then
        setsebool -P container_manage_cgroup true
    fi
  fi
fi

if command -v podman-compose &> /dev/null; then
    export DOCKER_COMPOSE=podman-compose
else
    export DOCKER_COMPOSE=docker-compose
fi

bash $SCRIPT_DIR/stop.sh

# Generate conf/env from env...
if [ "$SCRIPT_DIR/env" -nt "$SCRIPT_DIR/conf/env" ]; then
  echo "Generating conf/env..."
  envsubst < $SCRIPT_DIR/env > $SCRIPT_DIR/conf/env
fi

# Generate conf/mongo-init.js from template...
if [ "$SCRIPT_DIR/conf/mongo-init-template.js" -nt " $SCRIPT_DIR/conf/mongo-init.js" ]; then
  echo "Generating conf/env..."
  envsubst < $SCRIPT_DIR/conf/mongo-init-template.js > $SCRIPT_DIR/conf/mongo-init.js
fi

# As we want to re-use the current repository (and its local changes),
# build image from the parent directory...
cd $SCRIPT_DIR/..

# docker build \
#   --build-arg FEDORA_VERSION="${FEDORA_VERSION}" \
#   --build-arg APACHE_RIVET_TAG="${APACHE_RIVET_TAG}" \
#   --build-arg ROOT_PASSWORD="${ROOT_PASSWORD}" \
#   -t ${IMAGE_NAME}:${IMAGE_VERSION} \
#   -f docker/Dockerfile .

${DOCKER_COMPOSE} \
        --project-name ${PROJECT_NAME} \
        -f ./docker/docker-compose.yml \
        build \
        --build-arg FEDORA_VERSION="${FEDORA_VERSION}" \
        --build-arg APACHE_RIVET_TAG="${APACHE_RIVET_TAG}" \
        --build-arg ROOT_PASSWORD="${ROOT_PASSWORD}"
