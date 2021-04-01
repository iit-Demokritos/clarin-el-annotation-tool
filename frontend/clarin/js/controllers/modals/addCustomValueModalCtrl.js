angular.module('clarin-el').controller('addCustomValueModalCtrl', function ($scope,$compile,$modalInstance, Dialog,TextWidgetAPI,CoreferenceColor){
  	$scope.flash = "";
  	$scope.buttonAttribute=""
  	$scope.buttonLabel=""

  	$scope.addbutton = function () {
  	  var foundInCollection = TextWidgetAPI.getFoundInCollection();
  	  var annotationSchema  = TextWidgetAPI.getAnnotationSchema();
  	  var annotatorType = TextWidgetAPI.getAnnotatorType();
  	
  	 // console.log(foundInCollection)
  	  //var colorCombo = CoreferenceColor.getColorCombination();
  	 // TextWidgetAPI.clearFoundInCollection()
  	 
  	  var customvalue = [{ attributes:[{value:$scope.buttonLabel,custom_attribute:$scope.buttonAttribute}]}]
  	  // foundInCollection.push(customvalue)  
  	  // console.log(foundInCollection)
  	   TextWidgetAPI.setFoundInCollection(customvalue)  
  	    $modalInstance.dismiss("cancel");
    	  $scope.$destroy(); 
  	     
          // foundInCollection.append(compiledTemplate);
           //TextWidgetAPI.setFoundInCollection(foundInCollection)
    	//console.log("btn_attribute: "+$scope.buttonAttribute+",btn_label: "+$scope.buttonLabel)
  	
  	}

  	$scope.cancel = function () {
    	$modalInstance.dismiss("cancel");
    	$scope.$destroy();
  	}
});
