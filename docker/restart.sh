#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [ ! -f "${SCRIPT_DIR}/env" ]; then
  echo "File does not exist: ${SCRIPT_DIR}/env" 1>&2
  echo "Please copy file \"${SCRIPT_DIR}/env-dist\" to \"${SCRIPT_DIR}/env\", and modify it accordingly!" 1>&2
  exit 1
fi

bash $SCRIPT_DIR/stop.sh
bash $SCRIPT_DIR/start.sh
