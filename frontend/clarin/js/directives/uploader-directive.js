angular.module('clarin-el').directive('uploader', function() {
	return {
		restrict: 'E',
		scope : true,
		require: '^flowInit',
		templateUrl: 'templates/directives/uploader.html',
		controller: function($scope) {
			$scope.unsupportedFiles = [];
			$scope.fileEncodingOptions = ["UTF-8", "Unicode"];
			$scope.defaultEncodingIndex = 0;
			$scope.fileHandlerOptions = [
                          {name: 'No Handler',     value: 'none'},
                          {name: 'TEI XML Import', value: 'tei'},
                        ];
			$scope.defaultHandlerIndex = 0;
			$scope.allowedTypes = ["text/plain", "text/xml"];
			$scope.fileTypeOptions = ["Text", "TEI XML"];
			$scope.defaultTypeIndex = 0;

			$scope.$watch("$flow.files.length", function( newValue, oldValue ) {
				if (oldValue > newValue)
					$scope.$emit('flowEvent', {msg:"", userFiles:$scope.$flow.files});
			});
			$scope.$on('initializeUploaderEncoding', function(event, data) {
				var encodingIndex = $scope.encodingOptions.indexOf(data.encoding);
				$scope.defaultEncodingIndex = encodingIndex;
			});
			$scope.$on('initializeUploaderHandler', function(event, data) {
				var handlerIndex = $scope.handlerOptions.findIndex(function(item, index) {
                                  if (item.name == data.handler.name) return true;
                                });
				$scope.defaultHandlerIndex = handlerIndex;
			});
			$scope.$on('initializeUploaderFiles', function(event) {
				$scope.$flow.files = [];
				$scope.unsupportedFiles = [];
			});
			$scope.$on('flow::fileAdded', function (event, $flow, flowFile) {
				if(!$scope.allowedTypes.includes(flowFile.file.type) && $scope.filterFiles !== false){
					event.preventDefault();
					$scope.unsupportedFiles.push(flowFile);
				}
				// Guess the type...
				$scope.defaultTypeIndex = $scope.allowedTypes.indexOf(flowFile.file.type);
				if (flowFile.file.type == "text/xml") {
				  $scope.defaultHandlerIndex = $scope.handlerOptions.findIndex(function(item, index) {
                                    if (item.name == 'TEI XML Import') return true;
                                  });
				}
			});
			$scope.$on('flow::filesSubmitted', function (event, $flow, files) {
				if ($scope.unsupportedFiles.length === 1) {
					var message = "The file '" + $scope.unsupportedFiles[0].file.name + "' is not supported";
					$scope.$emit('flowEvent', {msg:message, userFiles:$flow.files});
				} else if ($scope.unsupportedFiles.length > 1) {
					var message = "The files ";
					angular.forEach($scope.unsupportedFiles, function(flowFile, key) {
						message += ("'" + flowFile.file.name + "'");
						if (key!==($scope.unsupportedFiles.length-1))
							message += ", ";
					});
					message += " are not supported";

					$scope.$emit('flowEvent', {msg: message, userFiles:$flow.files});
				} else {
					$scope.$emit('flowEvent', {msg: "", userFiles:$flow.files});
				}

				$scope.unsupportedFiles = [];
			});
		}
	};
});
