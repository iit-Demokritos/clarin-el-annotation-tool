<!DOCTYPE html>
<html lang="en">
<head>
  	<meta charset="UTF-8">
	<title>Clarin-EL</title>
	<base href="/clarin/">
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />

	<link href="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
	<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css" rel="stylesheet">
	<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700' rel='stylesheet' type='text/css'>

    <link rel="stylesheet" type="text/css" href="css/yamm.css">
    <link rel="stylesheet" type="text/css" href="css/tree-control-attribute.css">
    <link rel="stylesheet" type="text/css" href="css/codemirror.css">
	<link rel="stylesheet" type="text/css" href="bower_components/angular-ui-layout/src/ui-layout.css">
	<link rel="stylesheet" type="text/css" href="css/clarin.css">

	<script src="bower_components/jquery/dist/jquery.min.js"></script>
	<script src="bower_components/angular/angular.js"></script>
	<script src="bower_components/angular-sanitize/angular-sanitize.min.js"></script>
	<script src="bower_components/angular-animate/angular-animate.min.js"></script>
	<script src="bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>
	<script src="bower_components/oclazyload/dist/ocLazyLoad.min.js"></script>

	<script src="js/app.js"></script>
	<script src="js/config/ocLazyLoadConfig.js"></script>

  	<script>angular.module("clarin-el").constant("CSRF_TOKEN", '<?php echo csrf_token(); ?>');</script>
</head>
<body>
    <div class="container-fluid" ng-app="clarin-el">
	  <div id="view" ui-view></div>
    </div>
    <script src="js/services/flashService.js"></script>
    <script src="js/services/dialogService.js"></script>
    <script src="js/services/userService.js"></script>
    <script src="js/services/collectionService.js"></script>
    <script src="js/services/documentService.js"></script>
	<script src="js/controllers/navbarCtrl.js"></script>
    <script src="js/controllers/modals/baseModalCtrls.js"></script>
    <script src="js/directives/dom-helpers.js"></script>

    <script src="bower_components/angular-ui-layout/src/ui-layout.js"></script>
    <script src="bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js"></script>
    <script src="bower_components/underscore/underscore-min.js"></script>
    <script src="bower_components/jquery-slimscroll/jquery.slimscroll.min.js"></script>
    <script src="bower_components/codemirror/lib/codemirror.js"></script>
    <script src="bower_components/angular-smart-table/dist/smart-table.min.js"></script>
    <script src="bower_components/angular-tree-control/angular-tree-control.js"></script>
    <script src="bower_components/ng-flow/dist/ng-flow-standalone.min.js"></script>
    <script src="bower_components/modernizr/modernizr.js"></script>
    <!--<script src="bower_components/event-source-polyfill/src/eventsource.min.js"></script>-->
    <script src="js/lib/Objectid.js"></script>
</body>
</html>
