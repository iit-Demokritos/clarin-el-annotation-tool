#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

set -o allexport
source  ${SCRIPT_DIR}/env
set +o allexport

cd $SCRIPT_DIR/..

if command -v chcon &> /dev/null
then
    chcon -Rt svirt_sandbox_file_t .
fi

if command -v setsebool &> /dev/null
then
    setsebool -P container_manage_cgroup true
fi

if command -v podman-compose &> /dev/null; then
    export DOCKER_COMPOSE=podman-compose
else
    export DOCKER_COMPOSE=docker-compose
fi

# Generate conf/env from env...
if [ "$SCRIPT_DIR/env" -nt "$SCRIPT_DIR/conf/env" ]; then
  echo "Generating conf/env..."
  envsubst < $SCRIPT_DIR/env > $SCRIPT_DIR/conf/env
fi

${DOCKER_COMPOSE} --project-name ${PROJECT_NAME} \
                  -f docker/docker-compose.yml \
                  up -d --no-recreate
# docker run --systemd=always -p 8000:80 -p 8001:443 -it ${IMAGE_NAME}
echo "To execute a terminal, try:"
echo "  set -o allexport; source ${SCRIPT_DIR}/env; set +o allexport"
echo "  docker-compose --env-file=./conf/env exec web bash"
echo "  podman-compose exec web bash"
