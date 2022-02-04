#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

. ${SCRIPT_DIR}/env

chcon -Rt svirt_sandbox_file_t .
setsebool -P container_manage_cgroup true

# As we want to re-use the current repository (and its locla changes),
# build image from the parent directory...
cd ..
docker build \
  --build-arg FEDORA_VERSION="${FEDORA_VERSION}" \
  --build-arg APACHE_RIVET_TAG="${APACHE_RIVET_TAG}" \
  --build-arg ROOT_PASSWORD="${ROOT_PASSWORD}" \
  -t ${IMAGE_NAME}:${IMAGE_VERSION} \
  -f docker/Dockerfile .

echo "Image name: ${IMAGE_NAME}:${IMAGE_VERSION}"
