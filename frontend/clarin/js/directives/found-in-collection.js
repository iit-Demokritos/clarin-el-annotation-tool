angular.module('clarin-el').directive('foundInCollection', ['$compile', 'TextWidgetAPI', 'CoreferenceColor', function($compile, TextWidgetAPI, CoreferenceColor) {
  	return {
	    restrict: 'A',
	    replace: true,
	    link: function(scope, elem, attrs) {
	    	var updateFoundInCollection = function() {	
	    		var annotationSchema = TextWidgetAPI.getAnnotationSchema();
		    	var foundInCollection = TextWidgetAPI.getFoundInCollection();
	    		var template = "";
	    		var colsNumber = 1;

	    		var colSpans = elem[0].outerHTML.match(/colspan="[0-9]*"/g);
	          	if (colSpans.length>0) {
	          		splittedColSpan = colSpans[colSpans.length-1].split("\"");
	          		var colsNumber = parseInt(splittedColSpan[1]);
	          	} 

	          	for (var i=0; i<foundInCollection.length; i++) {
	          		var colorCombo = CoreferenceColor.getColorCombination();

	    			if (i%colsNumber==0)
	    				template += "<tr>";
	
	    			template += "<td><annotation-button id=\"x_button123\" annotation-type=\"" + annotationSchema.annotation_type + 
    																   "\" annotation-attribute=\"" + annotationSchema.attribute + 
    																   "\" annotation-value=\"" + foundInCollection[i].attributes[0].value + 
	    															   "\" label=\"" + foundInCollection[i].attributes[0].value + 
	    															   "\" bg-color=\"" + colorCombo.bg_color + 
	    															   "\" fg-color=\"" + colorCombo.fg_color + "\"></annotation-button></td>";								
		    	
	    			if (i==foundInCollection.length-1 || (i!=0 && (i+1)%colsNumber==0))
	    				template += "</tr>";
	          	}

	    		var compiledTemplate = $compile(template)(scope);
	    		elem.append(compiledTemplate);
	    	};

	    	TextWidgetAPI.registerFoundInCollectionCallback(updateFoundInCollection);
	    },
    }
}]);