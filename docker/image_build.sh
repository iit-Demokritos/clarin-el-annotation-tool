#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

set -o allexport
source  "${SCRIPT_DIR}/env-dist"
set +o allexport

## Make sure submodules have been initialised:
cd "$SCRIPT_DIR/.."
if command -v git &> /dev/null
then
    git submodule update --remote --init
else
    echo "git is not available. Please make sure submodules have been initialised!"
fi

## If npm is available, download the frontend packages...
if [ ! -d "$SCRIPT_DIR/../clarin-angular/node_modules" ] && command -v npm &> /dev/null
then
    cd "$SCRIPT_DIR/../clarin-angular"
    npm install --legacy-peer-deps --yes
fi

cd "$SCRIPT_DIR"

if command -v selinuxenabled &> /dev/null; then
  selinuxenabled
  if [ $? -ne 0 ]; then 
    echo "SELinux DISABLED!"
  else
    echo "SELInix ENABLED!"
    if command -v chcon &> /dev/null
    then
        echo "Setting context container_file_t on dir: \"$SCRIPT_DIR\""
        chcon -R -u unconfined_u -r object_r -t container_file_t "$SCRIPT_DIR"
    fi
    
    if command -v setsebool &> /dev/null
    then
        echo "Setting container_manage_cgroup to true..."
        getsebool container_manage_cgroup
        setsebool -P container_manage_cgroup true
        getsebool container_manage_cgroup
    fi
  fi
fi

# Generate conf/env from env...
if [ "$SCRIPT_DIR/env" -nt "$SCRIPT_DIR/conf/env" ]; then
  echo "Generating conf/env..."
  envsubst < "$SCRIPT_DIR/env" > "$SCRIPT_DIR/conf/env"
fi

# Generate conf/mongo-init.js from template...
if [ "$SCRIPT_DIR/conf/mongo-init-template.js" -nt " $SCRIPT_DIR/conf/mongo-init.js" ]; then
  echo "Generating conf/env..."
  envsubst < "$SCRIPT_DIR/conf/mongo-init-template.js" > "$SCRIPT_DIR/conf/mongo-init.js"
fi

# Copy Python requirements file...
cp -f "$SCRIPT_DIR/../backend-django/requirements.txt" "$SCRIPT_DIR/conf/requirements.txt"
# Remove some packages to lighten the image...
declare -a PackagesStringArray=("transformers" "torch")
for package in "${PackagesStringArray[@]}"; do
  echo "Removing Python package: \"$package\""
  sed "/$package/d" "$SCRIPT_DIR/conf/requirements.txt" > "$SCRIPT_DIR/conf/requirements.txt.new"
  mv -f "$SCRIPT_DIR/conf/requirements.txt.new" "$SCRIPT_DIR/conf/requirements.txt"
done

# As we want to re-use the current repository (and its local changes),
# build image from the parent directory...
cd $SCRIPT_DIR/..

# docker build \
#   --build-arg FEDORA_VERSION="${FEDORA_VERSION}" \
#   --build-arg APACHE_RIVET_TAG="${APACHE_RIVET_TAG}" \
#   --build-arg ROOT_PASSWORD="${ROOT_PASSWORD}" \
#   -t ${IMAGE_NAME}:${IMAGE_VERSION} \
#   -f docker/Dockerfile .

docker build \
  --ignorefile docker/.dockerignore \
  -t ${DOCKER_HUB_NAME}:${IMAGE_VERSION} \
  -t ${DOCKER_HUB_NAME}:latest \
  -f docker/Dockerfile .

# podman login docker.io
# podman push docker.io/petasis/ellogon-web-annotation-tool:v0.1.3
# podman push docker.io/petasis/ellogon-web-annotation-tool:latest

echo "To run the container, try:"
echo "  set -o allexport; source ${SCRIPT_DIR}/conf/env; set +o allexport"
echo "  docker run --systemd=always -p 8000:80 -p 8001:443 -it ${IMAGE_NAME}"
