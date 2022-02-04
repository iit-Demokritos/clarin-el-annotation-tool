#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

. ${SCRIPT_DIR}/env

docker run --systemd=always -p 8000:80 -p 8001:443 -it ${IMAGE_NAME}
