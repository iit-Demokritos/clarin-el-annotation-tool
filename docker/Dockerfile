ARG FEDORA_VERSION="35"
FROM fedora:${FEDORA_VERSION}

ARG APACHE_RIVET_TAG="3.2.1"
# ARG ROOT_PASSWORD

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
    python3-certbot-apache       \
    mod_ssl                      \
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
    mariadb-connector-c-devel    \
    hugo

RUN pip --disable-pip-version-check install wheel && \
    pip --disable-pip-version-check install \
        django-environ                      \
        djangorestframework                 \
        djangorestframework-simplejwt       \
        drf-spectacular                     \
        simplejwt                           \
        dataclasses_json

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

# Create the apache python virtual env...
RUN python3 -m venv --system-site-packages /var/www/apache_venv 
ADD backend-django/requirements.txt /var/www/apache_venv/requirements.txt
RUN . /var/www/apache_venv/bin/activate && \
    pip --disable-pip-version-check install wheel && \
    pip --disable-pip-version-check install -r /var/www/apache_venv/requirements.txt

# Install the annotation tool...
# RUN mkdir -p /var/www && \
#     cd /var/www && \
#     git clone --recurse-submodules https://github.com/iit-Demokritos/clarin-el-annotation-tool.git && \
#     cd clarin-el-annotation-tool && \
#     rm -rf backend frontend && \
#     rm -f clarin
ADD build_all.sh   /var/www/clarin-el-annotation-tool/build_all.sh
ADD ChangeLog.txt  /var/www/clarin-el-annotation-tool/ChangeLog.txt
ADD clarin-angular /var/www/clarin-el-annotation-tool/clarin-angular

# Install Javascript packages...
RUN cd /var/www/clarin-el-annotation-tool/clarin-angular && \
    mkdir -p dist/clarin-angular && \
    npm install -g @angular/cli && \
    npm install --legacy-peer-deps

# Add Django backend...
ADD backend-django /var/www/clarin-el-annotation-tool/backend-django

# Build everything...
#ADD docker/conf/env /var/www/clarin-el-annotation-tool/backend-django/DjangoClarin/.env
RUN cd /var/www/clarin-el-annotation-tool && \
    bash build_all.sh

# We open ports 80/443, the default ones for HTTP/HTTPS for Apache server to listen on
EXPOSE 80 
EXPOSE 443

RUN systemctl set-default multi-user.target

RUN systemctl enable httpd
#RUN firewall-cmd --permanent --zone=public --add-service=http
#RUN firewall-cmd --permanent --zone=public --add-service=https

## Create an Apache conf include
# Add custom Apache Rivet configuration file to the container
ADD docker/conf/rivet.conf /etc/httpd/conf.d/rivet.conf
ADD docker/conf/ellogon_annotation_tool.conf /etc/httpd/conf.d/ellogon_annotation_tool.conf

#RUN echo ${ROOT_PASSWORD} | passwd root --stdin

STOPSIGNAL SIGRTMIN+3

# Workaround for docker/docker#27202, technique based on comments from docker/docker#9212
#CMD ["/sbin/init"]

# The following command is needed if httpd is not started by systemd.
# The httpd service (/usr/lib/systemd/system/httpd.service) has a soft dependency on httpd-init.service.
# httpd-init.service (/usr/lib/systemd/system/httpd-init.service) is part of the mod_ssl package.
# httpd-init.service executes /usr/libexec/httpd-ssl-gencerts, which generates the certificate using sscg.
#
# The relevant part of the /usr/libexec/httpd-ssl-gencerts is this:
#
# sscg -q                                                             \
#      --cert-file           /etc/pki/tls/certs/localhost.crt         \
#      --cert-key-file       /etc/pki/tls/private/localhost.key       \
#      --ca-file             /etc/pki/tls/certs/localhost.crt         \
#      --lifetime            365                                      \
#      --hostname            $FQDN                                    \
#      --email               root@$FQDN
RUN /usr/libexec/httpd-ssl-gencerts

COPY docker/conf/docker-entrypoint.sh /usr/local/bin/
# ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]

# RUN dnf install -y phpMyAdmin mariadb
# # Change "localhost" to "mariadb" in config...
# RUN sed -i 's/localhost/mariadb/g' /etc/phpMyAdmin/config.inc.php
