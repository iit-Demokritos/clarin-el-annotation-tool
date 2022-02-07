#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

set -o allexport
source  ${SCRIPT_DIR}/env
set +o allexport

# if [[ -z "$EMAIL_URL" ]]; then
#   echo "Please provide EMAIL_URL in environment:" 1>&2
#   echo " E.g: EMAIL_URL=smtp+tls://user:pass@host:587" 1>&2
#   exit 1
# fi

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
                  -f docker/docker-compose.yml \
                  exec web bash -c "cd /var/www/clarin-el-annotation-tool/backend-django/ && python manage.py wait_for_db"
${DOCKER_COMPOSE} --project-name ${PROJECT_NAME} \
                  -f docker/docker-compose.yml \
                  exec web bash -c "cd /var/www/clarin-el-annotation-tool/backend-django/ && python manage.py migrate"
# docker run --systemd=always -p 8000:80 -p 8001:443 -it ${IMAGE_NAME}
echo "To execute a terminal, try:"
echo "  set -o allexport; source ${SCRIPT_DIR}/env; set +o allexport"
echo "  docker-compose --env-file=./conf/env exec web bash"
echo "  podman-compose exec web bash"
