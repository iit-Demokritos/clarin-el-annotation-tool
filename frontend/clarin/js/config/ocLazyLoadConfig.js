app.config(function($ocLazyLoadProvider) {
	$ocLazyLoadProvider.config({
		debug: false,
		modules: [{
			name: 'addDocumentsModalCtrl',
			files: [ 
				'js/controllers/modals/addDocumentsModalCtrl.js',
				'js/directives/uploader-directive.js'
			]
		}, {
			name: 'renameCollectionModalCtrl',
			files: [
				'js/controllers/modals/renameCollectionModalCtrl.js'
			]
		}, {
			name: 'shareCollectionModalCtrl',
			files: [
				'js/services/sharedCollectionService.js',
				'js/controllers/modals/shareCollectionModalCtrl.js'
			]
		}, {
			name: 'detectOpenDocModalCtrl',
			files: [
				'js/controllers/modals/detectOpenDocModalCtrl.js'
			]
		}, {
			name: 'detectChangesModalCtrl',
			files: [
				'js/controllers/modals/detectChangesModalCtrl.js'
			]
		}, {
			name: 'annotationServices',
			files: [
				'js/directives/button/button-annotator-value-list.js',
				'js/directives/coref/coref-annotator-value-list.js',
				'js/services/text-widget-api.js',
				'js/services/coreferenceColorDataService.js',
				'js/services/coreferenceColorService.js',
				'js/services/openDocumentService.js',
				'js/services/annotationService.js',
				'js/services/tempAnnotationService.js',
				'js/services/buttonAnnotatorService.js',
				'js/services/buttonColorService.js',
				'js/services/coreferenceAnnotatorService.js',
				'js/services/annotatorsTemplateService.js',
				'js/services/restoreAnnotationService.js',
				'js/services/annotationSchemaService.js',
				'js/services/sharedCollectionService.js',
				'js/controllers/annotationCtrl.js',
				'js/controllers/modals/selectDocumentModalCtrl.js',
				'js/directives/toolbar-widget.js',
				'js/directives/text-widget.js',
				'js/directives/overlapping-areas.js',
				'js/directives/annotation-visualizer.js',
				'js/directives/annotator-widget.js'
			]
		}, {
			name: 'annotationWidgets',
			files: [
				'js/directives/button/annotation-button.js',
				'js/directives/button/annotation-relation-combobox.js',
				'js/directives/button/annotation-relation-import-btn.js',
				'js/directives/button/annotation-relation-clear-btn.js',
				'js/directives/button/annotation-relation.js',
				//'js/directives/button/annotation-relation-del-btn.js',
				'js/directives/button/annotation-relation-annotate-btn.js',
				'js/directives/button/annotation-combobox.js',
				'js/directives/button/annotation-dateentry.js',
				'js/directives/button/annotation-entry.js',
				'js/directives/button/annotation-indicator.js',
	
				'js/directives/coref/coref-add-btn.js',
				'js/directives/coref/coref-annotate-btn.js',
				'js/directives/coref/coref-btn.js',
				'js/directives/coref/coref-checkbox.js',
				'js/directives/coref/coref-clear-btn.js',
				'js/directives/coref/coref-combobox.js',
				'js/directives/coref/coref-del-btn.js',
				'js/directives/coref/coref-entry.js',
				'js/directives/coref/coref-import-btn.js',
				'js/directives/coref/coref-multi-entry.js',
				'js/directives/coref/coref-segment-entry.js',
				'js/directives/coref/coref-span-end.js',
				'js/directives/coref/coref-span-start.js',
	
				'js/directives/found-in-collection.js'
			]
		}]
	});
});
