angular.module('clarin-el').controller('selectDocumentModalCtrl', function (AnnotationSchema, $timeout, $scope, $filter, $modalInstance, externalData, ButtonAnnotator, CoreferenceAnnotator, Document, Collection){
  	$scope.subheader = "Button Annotator";
  	$scope.annotationSchemaExists = false;
  	$scope.showSelectDocument = true;
  	$scope.documentSelectorHeight = 300;
  	$scope.selectedDocument = {};
  	$scope.treeOptions = { dirSelectable: false };

  	$scope.flash = "";
  	$scope.annotationSchema = {
	    language : "",
	    annotation_type : "",
	    attribute : "",
	    alternative : ""
  	};
  	$scope.annotationSchemaOptions = {
	    languages : [],
	    annotation_types : [],
	    attributes : [],
	    alternatives : [],
	    values : []
  	};

  	var annotationSchema = externalData.annotationSchema;
  	if (!angular.isUndefined(annotationSchema) && !angular.equals({}, annotationSchema)) {
    	$scope.annotationSchemaExists = true;
    	$scope.subheader = externalData.annotator;
  	}

  	//var data = externalData.collectionsData;
  	$scope.dataForTheTree = externalData.collectionsData;

  	var emptyValuesArrays = function () {
    	$scope.groups = [];
    	$scope.attrs  = [];
    	
    	if (angular.equals($scope.subheader, "Button Annotator"))	
    		$scope.annotationSchemaOptions.values = [];
    	else
    		$scope.annotationSchemaOptions.attributes = [];
  	};

  	$scope.initializeLanguages = function () {	  	//fill the language select
  		AnnotationSchema.restore($scope.subheader)
		.then(function(response) { 
			$scope.annotationSchemaOptions = angular.copy(response.annotationSchemaOptions);
			$scope.annotationSchema = angular.copy(response.savedAnnotationSchema);
			$scope.changeAttributeAlternative($scope.annotationSchema.alternative);
		}, function(languages){
			if (!angular.isUndefined(languages)) {
				$scope.flash = "";
				$scope.annotationSchemaOptions.languages = languages;
			} else
				$scope.flash = "An error occured. Please refresh the page and try again";
		});
  	}
  
  	$scope.initializeLanguages();

  	$scope.updateSubheader = function(subheaderValue){
    	if (!angular.equals($scope.subheader, subheaderValue)) {
      		$scope.subheader = subheaderValue;
      		$scope.initializeLanguages();
    	}
  	}

  	$scope.changeLanguage = function(lang) {			//trigger function when the language changes
    	$scope.annotationSchema.language = lang;
    	$scope.changeAttributeAlternative (null);

    	switch ($scope.subheader) {
     		case "Button Annotator":
		        ButtonAnnotator.getAnnotationTypes($scope.annotationSchema.language).then(function(data) {
		          	$scope.annotationSchemaOptions.annotation_types = data.annotation_types;
		        });
		        break;
      		case "Coreference Annotator":
        		CoreferenceAnnotator.getAnnotationTypes($scope.annotationSchema.language).then(function(data) {
          			$scope.annotationSchemaOptions.annotation_types = data.annotation_types;
        		});
        		break;
    	}
  	};
  
  	$scope.changeAnnotationType = function(type) {			//trigger function when the annotation type changes
    	if (angular.isUndefined(type) || type===null)
      		$scope.annotationSchema.annotation_type = "";
		else 
      		$scope.annotationSchema.annotation_type = type;

		$scope.changeAttributeAlternative (null);

    	switch ($scope.subheader) {
      		case "Button Annotator":
		        ButtonAnnotator.getAnnotationAttributes($scope.annotationSchema.language, $scope.annotationSchema.annotation_type)
		        .then(function(data) { 
		          	$scope.annotationSchemaOptions.attributes = data.attributes;
		        });
		        break;
      		case "Coreference Annotator":
		        CoreferenceAnnotator.getAttributeAlternatives($scope.annotationSchema.language, $scope.annotationSchema.annotation_type)
		        .then(function(data) {
		          	$scope.annotationSchemaOptions.alternatives = data.alternatives;
		        });
		        break;
    	}
  	};

  	$scope.changeAnnotationAttribute = function(attr) {		//trigger function when the annotation attribute changes
	    if (angular.isUndefined(attr) || attr===null)
	      	$scope.annotationSchema.attribute = "";
	    else 
	      	$scope.annotationSchema.attribute = attr;

    	$scope.changeAttributeAlternative (null);
    	ButtonAnnotator.getAttributeAlternatives($scope.annotationSchema.language, $scope.annotationSchema.annotation_type, $scope.annotationSchema.attribute)
    	.then(function(data) {
      		$scope.annotationSchemaOptions.alternatives = data.alternatives;
    	});
  	};

  	$scope.changeAttributeAlternative = function(attrAlt) {		//trigger function when the annotation attribute changes
    	if (angular.isUndefined(attrAlt) || attrAlt===null || attrAlt==="") {
      		$scope.annotationSchema.alternative = "";
      		emptyValuesArrays();
      		return false;
    	}
    	else 
      		$scope.annotationSchema.alternative = attrAlt;

		switch ($scope.subheader) {
      		case "Button Annotator":
        		ButtonAnnotator.getValues($scope.annotationSchema.language, $scope.annotationSchema.annotation_type, $scope.annotationSchema.attribute, $scope.annotationSchema.alternative)
        		.then(function(data) {
          			emptyValuesArrays();

		          	$scope.groups = angular.copy(data.groups);
		          	angular.forEach(data.groups, function(obj, key) {
		          		$scope.annotationSchemaOptions.values = $scope.annotationSchemaOptions.values.concat(obj.values); 
		          	});
        		});
        		break;
      		case "Coreference Annotator":
        		CoreferenceAnnotator.getValues($scope.annotationSchema.language, $scope.annotationSchema.annotation_type, $scope.annotationSchema.alternative)
        		.then(function(data) {
          			emptyValuesArrays();

					$scope.attrs = angular.copy(data.attributes);
      				angular.forEach(data.attributes, function(obj, key) {
          				$scope.annotationSchemaOptions.attributes.push(obj.attribute);
          			}); 
		        });
		        break;
		}
  	};
  
  	$scope.showSelected = function(sel) { 	//function to be called when a user clicks a document 
    	if (angular.isUndefined(sel))
      		$scope.selectedDocument = {};
    	else if (!('document_count' in sel)) {
      		$scope.selectedDocument = sel; 
    	}
  	};

  	$scope.selectDocument = function () {		//function to validate which document has been selected, if any
    	if(!angular.equals({}, $scope.selectedDocument)){
      		$scope.flash = "";
	  		$scope.selectedCollection = $filter('filter')($scope.dataForTheTree, {id: $scope.selectedDocument.collection_id});
	      	$scope.documentSelectorHeight = 0;
	      	$scope.showSelectDocument = false;
      	return true;
	    } else {
	      	$scope.flash = "Please select a document from the list..";
	      	return false;
	    }
  	};

  	$scope.resetSchema = function () {		//function to be called when a user decides to reset the current annotation schema
    	var documentSelectionResponse = $scope.selectDocument();
    	if (documentSelectionResponse) {       
      		if (!angular.isUndefined(annotationSchema)) {
        		$scope.annotationSchemaExists=false; 
        		$scope.showSelectDocument=false;  
      		}        
    	}
  	};
  
  	$scope.closeWithNewSchema = function() {		//fuction to close the modal by setting a new annotation schema
    	var userOptions = {
      		newAnnotator : $scope.subheader,
      		newAnnotationSchemaOptions : $scope.annotationSchemaOptions,
      		newAnnotationSchema : $scope.annotationSchema,
      		newCollection : $scope.selectedCollection[0],
      		newDocument : $scope.selectedDocument
		};

    	$modalInstance.close(userOptions);
    	$scope.$destroy();
  	};

  	$scope.closeWithSameSchema = function() {			//fuction to close the modal by setting the same annotation schema
		if (!angular.isUndefined(externalData.annotationSchema) && !angular.equals({}, externalData.annotationSchema)) {      
      		var documentSelectionResponse = $scope.selectDocument();

      		if (documentSelectionResponse) {
        		var userOptions = {
          			newAnnotator : externalData.annotator,
          			newAnnotationSchemaOptions : $scope.annotationSchemaOptions,
          			newAnnotationSchema : angular.copy(externalData.annotationSchema),
          			newCollection : $scope.selectedCollection[0],
          			newDocument : $scope.selectedDocument
        		};

        		$modalInstance.close(userOptions);
        		$scope.$destroy();
      		} 
    	}
  	};

  	$scope.back = function() {
    	$scope.showSelectDocument = true;
    	$scope.documentSelectorHeight = 300;
  	};
});