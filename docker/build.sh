#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

. ${SCRIPT_DIR}/env

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
if command -v chcon &> /dev/null
then
    chcon -Rt svirt_sandbox_file_t .
fi

if command -v setsebool &> /dev/null
then
    setsebool -P container_manage_cgroup true
fi

# As we want to re-use the current repository (and its locla changes),
# build image from the parent directory...
cd $SCRIPT_DIR/..

docker build \
  --build-arg FEDORA_VERSION="${FEDORA_VERSION}" \
  --build-arg APACHE_RIVET_TAG="${APACHE_RIVET_TAG}" \
  --build-arg ROOT_PASSWORD="${ROOT_PASSWORD}" \
  -t ${IMAGE_NAME}:${IMAGE_VERSION} \
  -f docker/Dockerfile .

echo "Image name: ${IMAGE_NAME}:${IMAGE_VERSION}"
