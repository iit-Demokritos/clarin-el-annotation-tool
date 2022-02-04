#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

. ${SCRIPT_DIR}/env

chcon -Rt svirt_sandbox_file_t .
setsebool -P container_manage_cgroup true

echo $APACHE_RIVET_TAG

docker build \
  --build-arg FEDORA_VERSION="${FEDORA_VERSION}" \
  --build-arg APACHE_RIVET_TAG="${APACHE_RIVET_TAG}" \
  --build-arg ROOT_PASSWORD="${ROOT_PASSWORD}" \
  -t ${IMAGE_NAME}:${IMAGE_VERSION} .

echo "Image name: ${IMAGE_NAME}:${IMAGE_VERSION}"
