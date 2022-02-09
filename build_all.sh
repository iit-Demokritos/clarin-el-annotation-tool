#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ANGULAR2_PROJECT_NAME=clarin-angular
ANGULAR2_DIR=$SCRIPT_DIR/$ANGULAR2_PROJECT_NAME

#LARAVEL_DIR=$SCRIPT_DIR/backend/clarin

DJANGO_DIR=$SCRIPT_DIR/backend-django
DJANGO_STATIC_DIR=$DJANGO_DIR/clarin_backend/static
DJANGO_TEMPLATES_DIR=$DJANGO_DIR/clarin_backend/templates

DJANGO_VENV=$DJANGO_DIR/apache_venv

## Set the correct SELinux context.
#  sudo setsebool -P httpd_enable_homedirs on
if [ -d "$DJANGO_VENV" ]; then
  chcon -R -t httpd_user_content_t $DJANGO_VENV
fi

## Angular 2 UI
cd $ANGULAR2_DIR

## Install modules...
#rm -rf ./node_modules
#npm install
#rm -rf ./node_modules/@types/lodash
#cp --force src/css/clarin.css src/css/clarin.scss

## Build Angular project (will create dist/clarin-angular folder)
ng build
#        --configuration production
#        --aot true --build-optimizer true --optimization true

#rm -rf src/css/clarin.scss

## Copy dist to $DJANGO_STATIC_DIR
echo "Copying distribution to Django: $DJANGO_STATIC_DIR"
mkdir -p $DJANGO_STATIC_DIR
rm -rf $DJANGO_STATIC_DIR/assets $DJANGO_STATIC_DIR/*es2015*.js \
       $DJANGO_STATIC_DIR/*-es5.*.js $DJANGO_STATIC_DIR/favicon.ico \
       $DJANGO_STATIC_DIR/index.html $DJANGO_STATIC_DIR/scripts.*.js \
       $DJANGO_STATIC_DIR/styles.*.css
mkdir -p $DJANGO_TEMPLATES_DIR
cp --force -r dist/$ANGULAR2_PROJECT_NAME/* \
              $DJANGO_STATIC_DIR
cp --force dist/$ANGULAR2_PROJECT_NAME/index.html $DJANGO_TEMPLATES_DIR/index.html
rm -rf $DJANGO_STATIC_DIR/index.php $DJANGO_STATIC_DIR/index.htm* $DJANGO_STATIC_DIR/3rdpartylicenses.txt
## Patch index.html to add the "static" prefix in scripts...
sed -i "s/script src=\"/script src=\"static\//g" $DJANGO_TEMPLATES_DIR/index.html
sed -i "s/href=\"styles\./href=\"static\/styles\./g" $DJANGO_TEMPLATES_DIR/index.html
(cd $DJANGO_DIR ; rm -rf static/* ; python3 manage.py collectstatic --noinput)

## Copy Laravel's index.php to dist/clarin-angular
cp --force src/index.php dist/$ANGULAR2_PROJECT_NAME/index.php
#cp --force dist/$ANGULAR2_PROJECT_NAME/index.html \
#           $LARAVEL_DIR/resources/views/angular2_index.php
#sed '/^<\/head>.*/i \ \ <link rel="stylesheet" type="text/css" href="assets/css/clarin.css">' \
#        dist/$ANGULAR2_PROJECT_NAME/index.html \
#        > $LARAVEL_DIR/resources/views/angular2_index.php
cp --force -r src/css dist/$ANGULAR2_PROJECT_NAME/assets
