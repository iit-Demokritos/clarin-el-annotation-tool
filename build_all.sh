#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ANGULAR2_PROJECT_NAME=clarin-angular
ANGULAR2_DIR=$SCRIPT_DIR/$ANGULAR2_PROJECT_NAME

LARAVEL_DIR=$SCRIPT_DIR/backend/clarin

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

## Copy Laravel's index.php to dist/clarin-angular
cp --force src/index.php dist/$ANGULAR2_PROJECT_NAME/index.php
cp --force dist/$ANGULAR2_PROJECT_NAME/index.html \
	   $LARAVEL_DIR/resources/views/angular2_index.php
#sed '/^<\/head>.*/i \ \ <link rel="stylesheet" type="text/css" href="assets/css/clarin.css">' \
#	dist/$ANGULAR2_PROJECT_NAME/index.html \
#	> $LARAVEL_DIR/resources/views/angular2_index.php
cp --force -r src/css dist/$ANGULAR2_PROJECT_NAME/assets
