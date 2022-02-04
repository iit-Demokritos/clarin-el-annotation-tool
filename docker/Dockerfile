ARG FEDORA_VERSION="35"
FROM fedora:${FEDORA_VERSION}

ARG APACHE_RIVET_TAG="3.2.1"
ARG ROOT_PASSWORD="arAlfAcIrAkpocvossedPot7"

ENV container docker

# Perform a generic update
RUN dnf -y update

# Install needed packages...
RUN dnf -y install               \
    autoconf                     \
    automake                     \
    libtool                      \
    passwd                       \
    httpd-devel                  \
    file                         \
    git                          \
    svn                          \
    tcl-devel                    \
    tdom                         \
    tcllib                       \
    npm                          \
    python3-mod_wsgi             \
    python3-devel                \
    python3-pip                  \
    python-pip-wheel             \
    python3-mysqlclient          \
    python3-pymongo              \
    python3-django               \
    python3-bcrypt               \
    python3-beautifulsoup4       \
    python3-lxml                 \
    python3-six                  \
    python3-pyyaml               \
    python3-uritemplate          \
    mysql-connector-python3      \
    mariadb-connector-c-devel

## Build Apache Rivet...
RUN mkdir /home/packages && \
    cd /home/packages && \
    git clone --recurse-submodules https://github.com/apache/tcl-rivet.git rivet && \
    echo "Checking Apache Rivet version: ${APACHE_RIVET_TAG}" && \
    cd /home/packages/rivet && \
    git -c advice.detachedHead=false checkout tags/${APACHE_RIVET_TAG}

RUN cd /home/packages/rivet && \
    autoreconf -fi && \
    bash ./configure && \
    make install && \
    rm -rf /home/packages/rivet

## Create an Apache conf include
# Add custom Apache Rivet configuration file to the container
ADD docker/conf/rivet.conf /etc/httpd/conf.d/rivet.conf
ADD docker/conf/ellogon_annotation_tool.conf /etc/httpd/conf.d/ellogon_annotation_tool.conf

# Compile & install rl_json library
RUN cd /home/packages && \
    git clone --recurse-submodules https://github.com/RubyLane/rl_json.git && \
    cd  /home/packages/rl_json && \
    autoreconf -fi && \
    bash ./configure && \
    make install && \
    rm -rf /home/packages/rl_json

# Ellogon install (to test run: tclsh /opt/Ellogon/ellogon)
RUN cd /opt && \
    mkdir Ellogon && \
    chown -R root:root Ellogon && \
    cd /opt && \
    svn checkout svn://svn.code.sf.net/p/ellogon/code/runtime Ellogon --quiet

# Install ellogon apache services (from SVN)
RUN cd /opt && \
    mkdir -p /opt/WebServices/EllogonAnnotationTool && \
    cd /opt/WebServices/EllogonAnnotationTool && \
    svn checkout svn://petasis.dyndns.org/clarin-el ellogon-apache-services --quiet && \
    rm -rf /opt/WebServices/EllogonAnnotationTool/ellogon-apache-services/apache-rivet/server/conf.d/10_create_objects.tcl && \
    tclsh /opt/WebServices/EllogonAnnotationTool/ellogon-apache-services/apache-rivet/server/server_init.tcl && \
    chmod 755 $HOME

# Install the annotation tool...
# RUN mkdir -p /var/www && \
#     cd /var/www && \
#     git clone --recurse-submodules https://github.com/iit-Demokritos/clarin-el-annotation-tool.git && \
#     cd clarin-el-annotation-tool && \
#     rm -rf backend frontend && \
#     rm -f clarin
ADD backend-django /var/www/clarin-el-annotation-tool/backend-django
ADD clarin-angular /var/www/clarin-el-annotation-tool/clarin-angular
ADD build_all.sh   /var/www/clarin-el-annotation-tool/build_all.sh
ADD ChangeLog.txt  /var/www/clarin-el-annotation-tool/ChangeLog.txt

# Create the apache python virtual env...
RUN cd /var/www/clarin-el-annotation-tool/backend-django/ && \
    python -m venv --system-site-packages /var/www/clarin-el-annotation-tool/backend-django/apache_venv && \
    . /var/www/clarin-el-annotation-tool/backend-django/apache_venv/bin/activate && \
    pip --disable-pip-version-check install wheel && \
    pip --disable-pip-version-check install -r /var/www/clarin-el-annotation-tool/backend-django/requirements.txt

# Install Javascript packages...
RUN cd /var/www/clarin-el-annotation-tool/clarin-angular && \
    mkdir -p dist/clarin-angular && \
    npm install -g @angular/cli && \
    npm install --legacy-peer-deps

# Build everything...
ADD docker/conf/env /var/www/clarin-el-annotation-tool/backend-django/DjangoClarin/.env
RUN pip --disable-pip-version-check install wheel && \
    pip --disable-pip-version-check install django-environ djangorestframework djangorestframework-simplejwt \
                drf-spectacular simplejwt dataclasses_json
RUN cd /var/www/clarin-el-annotation-tool && \
    bash build_all.sh

# We open ports 80/443, the default ones for HTTP/HTTPS for Apache server to listen on
EXPOSE 80 
EXPOSE 443

RUN systemctl set-default multi-user.target

RUN systemctl enable httpd

RUN echo ${ROOT_PASSWORD} | passwd root --stdin

STOPSIGNAL SIGRTMIN+3

# Workaround for docker/docker#27202, technique based on comments from docker/docker#9212
CMD ["/sbin/init"]
