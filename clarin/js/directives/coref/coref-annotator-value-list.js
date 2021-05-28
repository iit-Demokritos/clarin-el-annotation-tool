angular.module('clarin-el').directive('coreferenceAnnotatorValueList', function() {
	return {
		restrict: 'A',
		replace : true,
		scope: {
			ngModel: '='
		},
		link: function(scope, element, attrs) {
			scope.$watch('ngModel', function() {
				var template = "";
				if (scope.ngModel === undefined) return false;

				for(var i=0; i<scope.ngModel.length; i++) {
					template += "<li class=\"list-group-item list-group-item-info\">"
					template += scope.ngModel[i].attribute;
					template += "</li>";

					/*for(var j=0; j<scope.ngModel[i].values.length; j++) {
					 template += "<li class=\"list-group-item\">"
					 template += scope.ngModel[i].values[j];
					 template += "</li>";
					 }*/
				}

				element.empty().append(template);
			});
		}
	};
});