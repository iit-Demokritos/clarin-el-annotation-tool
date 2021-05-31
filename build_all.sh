#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ANGULAR2_PROJECT_NAME=clarin-angular
ANGULAR2_DIR=$SCRIPT_DIR/$ANGULAR2_PROJECT_NAME

LARAVEL_DIR=$SCRIPT_DIR/backend/clarin

## Angular 2 UI
cd $ANGULAR2_DIR

## Install modules...
#npm install

## Build Angular project (will create dist/clarin-angular folder)
ng build

## Copy Laravel's index.php to dist/clarin-angular
cp --force src/index.php dist/$ANGULAR2_PROJECT_NAME/index.php
cp --force dist/$ANGULAR2_PROJECT_NAME/index.html \
	   $LARAVEL_DIR/resources/views/angular2_index.php
