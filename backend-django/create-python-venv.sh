#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Creating python venv in: $SCRIPT_DIR"
python3 -m venv --system-site-packages "$SCRIPT_DIR/apache_venv"
. "$SCRIPT_DIR/apache_venv/bin/activate" && \
    pip --disable-pip-version-check install wheel && \
    pip --disable-pip-version-check install -r "$SCRIPT_DIR/requirements.txt"
chcon -R -t httpd_sys_content_t "$SCRIPT_DIR/apache_venv"
cd "$SCRIPT_DIR"
find . -name *.so -exec chcon -R -h -t httpd_sys_script_exec_t {} \;
