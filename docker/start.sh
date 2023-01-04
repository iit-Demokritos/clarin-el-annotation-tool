#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [ ! -f "${SCRIPT_DIR}/env" ]; then
  echo "File does not exist: ${SCRIPT_DIR}/env" 1>&2
  echo "Please copy file \"${SCRIPT_DIR}/env-dist\" to \"${SCRIPT_DIR}/env\", and modify it accordingly!" 1>&2
  exit 1
fi

set -o allexport
source  ${SCRIPT_DIR}/env
set +o allexport

if [[ -z "$EMAIL_URL" ]]; then
  echo "Please provide EMAIL_URL in environment:" 1>&2
  echo " E.g: EMAIL_URL=smtp+tls://user:pass@host:587" 1>&2
  echo " Please define this variable in: ${SCRIPT_DIR}/env" 1>&2
  exit 1
fi

cd $SCRIPT_DIR

if command -v chcon &> /dev/null
then
    echo "Setting context container_file_t on dir: \"$SCRIPT_DIR/conf\""
    chcon -R -u unconfined_u -r object_r -t container_file_t "$SCRIPT_DIR/conf"
fi

if command -v setsebool &> /dev/null
then
    echo "Setting container_manage_cgroup to true..."
    getsebool container_manage_cgroup
    setsebool -P container_manage_cgroup true
    getsebool container_manage_cgroup
fi

if command -v podman-compose &> /dev/null; then
    export DOCKER_COMPOSE=podman-compose
else
    export DOCKER_COMPOSE=docker-compose
fi

# Stop on errors...
set -e

# Generate conf/env from env...
if [ "$SCRIPT_DIR/env" -nt "$SCRIPT_DIR/conf/env" ]; then
  echo "Generating conf/env..."
  envsubst < $SCRIPT_DIR/env > $SCRIPT_DIR/conf/env
fi

# Generate conf/mongo-init.js from template...
if [ "$SCRIPT_DIR/conf/mongo-init-template.js" -nt " $SCRIPT_DIR/conf/mongo-init.js" ]; then
  echo "Generating conf/mongo-init.js..."
  envsubst < $SCRIPT_DIR/conf/mongo-init-template.js > $SCRIPT_DIR/conf/mongo-init.js
fi

${DOCKER_COMPOSE} --project-name ${PROJECT_NAME} \
                  -f "$SCRIPT_DIR/docker-compose.yml" \
                  up -d --no-recreate

# Perform migrations...
echo "Waiting for containers to start..."
secs=$((3 * 60))
while [ $secs -gt 0 ]; do
   echo -ne "Seconds: $secs\033[0K\r"
   sleep 1
   : $((secs--))
done
echo "Performing migrations..."
${DOCKER_COMPOSE} --project-name ${PROJECT_NAME} \
                  -f "$SCRIPT_DIR/docker-compose.yml" \
                  exec web bash -c "cd /var/www/clarin-el-annotation-tool/backend-django/ && python3 manage.py wait_for_db"
${DOCKER_COMPOSE} --project-name ${PROJECT_NAME} \
                  -f "$SCRIPT_DIR/docker-compose.yml" \
                  exec web bash -c "cd /var/www/clarin-el-annotation-tool/backend-django/ && python3 manage.py migrate"
# docker run --systemd=always -p 8000:80 -p 8001:443 -it ${IMAGE_NAME}
echo "To execute a terminal, try:"
echo "  set -o allexport; source \"${SCRIPT_DIR}/conf/env\"; set +o allexport"
echo "  docker-compose --env-file=\"${SCRIPT_DIR}/conf/env\" exec web bash"
echo "  podman-compose exec web bash"
