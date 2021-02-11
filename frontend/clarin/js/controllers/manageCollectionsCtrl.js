angular.module('clarin-el').controller('ManageCollectionsCtrl', ['$scope', '$ocLazyLoad','$q', '$filter', 'Collection', 'Document', 'Dialog',
    function($scope, $ocLazyLoad, $q, $filter, Collection, Document, Dialog){
        $scope.btnShow = true;
        $scope.showStaticHeader = true;
        $scope.sidebarSelector = "myCollections";
        $scope.selectedCollectionIndexTmp = -1;
        $scope.selectedCollectionIndex = null;
        $scope.selectedDocuments = [];

        function initializeCollections() {                //initialize the collections tree
            Collection.getAll().then(function(response) {
                if(!response.success) {
                    var modalOptions = { body: 'Error during the restoring of your collections. Please refresh the page and try again.' };
                    Dialog.error(modalOptions);
                } else {
                    /*$scope.collections = response.data;
            $scope.dataForTheTree = $scope.collections;*/
                    $scope.dataForTheTree =    angular.copy(response.data);
                }
            });
        };

        function initializeCollectionData() {            //refresh collection's data
            Document.getAll($scope.selectedCollection.id)
                .then(function(response) {
                    if(!response.success) {
                        var modalOptions = { body: 'Error during the restoring of your collection\'s documents. Please refresh the page and try again.' };
                        Dialog.error(modalOptions);
                    } else {  
                        $scope.collectionDocuments = response.data;
                        $scope.selectedDocuments = [];
                        $scope.showStaticHeader = false;
                        $scope.btnShow = true;
                    }
                });
        };

        $scope.showSelectedCollection = function(collection, index) {       //function to be called when a user selects a collection from the sidebar tree
            $scope.selectedCollectionIndex = index;
            $scope.selectedCollection = collection;
            initializeCollectionData();
        };

        $scope.deleteCollection = function(id) {                            //function to be called when a user presses the delete collection button
            if (!angular.isUndefined(id)){
                var modalOptions = {
                    headerType: 'warning',
                    header: 'Warning',
                    body: 'This action is going to delete the entire collection. Do you want to proceed?' ,
                    buttons : ['Yes', 'No'],
                    showCalcelButton : false
                };

                var modalInstance =  Dialog.confirm(modalOptions);
                modalInstance.result.then(function (modalResult) {
                    if (modalResult==="Yes"){
                        Collection.destroy(id)
                            .then(function(data) {
                                initializeCollections();
                                delete $scope.selectedCollection;
                                delete $scope.collectionDocuments;
                                $scope.showStaticHeader = true;
                                $scope.selectedCollectionIndex = null;
                            }, function(error){
                                var modalOptions = { body: 'Error in delete Collection. Please refresh the page and try again.' };
                                Dialog.error(modalOptions);
                            });
                    } 
                });    
            }
        };

        $scope.addDocuments = function() {                //function to be called when a user wants to add documents to a collection
            var data = {
                collectionId: $scope.selectedCollection.id, 
                collectionName: $scope.selectedCollection.name,
                collectionEncoding: $scope.selectedCollection.encoding
            };

            $ocLazyLoad.load('addDocumentsModalCtrl').then(function() {
                var modalInstance = Dialog.custom('add-documents-modal.html', 'addDocumentsModalCtrl', data);
                modalInstance.result.then(function(){
                    initializeCollections();
                    initializeCollectionData();
                });
            });
        };

	/**
	 * Import documents to the collection
	 */
	$scope.importDocuments = function() { 
            $ocLazyLoad.load('importModalCtrl').then(function() {
                var modalInstance = Dialog.custom('import-modal.html', 'importModalCtrl', {});
                modalInstance.result.then(function(){
                    initializeCollections();
                    initializeCollectionData();
                });
            });
        };


        $scope.renameCollection = function() {            //function to be called when a user wants to rename a collection
            var data = {
                collectionId: $scope.selectedCollection.id, 
                collectionName: $scope.selectedCollection.name
            };

            $ocLazyLoad.load('renameCollectionModalCtrl').then(function() {
                var modalInstance = Dialog.custom('rename-collection-modal.html', 'renameCollectionModalCtrl', data);
                modalInstance.result.then(function(newName) {
                    $scope.selectedCollection.name = newName;
                    initializeCollections();
                });
            });
        }

        $scope.shareCollection = function() {            //function to be called when a user wants to rename a collection
            var data = { 
                collectionId: $scope.selectedCollection.id,
                collectionName: $scope.selectedCollection.name
            };

            $ocLazyLoad.load('shareCollectionModalCtrl').then(function() {
                var modalInstance = Dialog.custom('share-collection-modal.html', 'shareCollectionModalCtrl', data);
                modalInstance.result.then(function(newName) {
                    /*$scope.selectedCollection.name = newName;
                initializeCollections();*/
                });
            });
        };

        $scope.deleteDocuments = function() {            //function to be called when a user wants to delete selected documents
            if ($scope.selectedDocuments.length==0)        //no document has been selected
                return false;

            var modalOptions = {
                headerType: 'warning',
                header: 'Warning',
                body: 'This action is going to delete the selected document(s) from your collection. Do you want to proceed?' ,
                buttons : ['Yes', 'No'],
                showCalcelButton : false
            };

            var modalInstance =  Dialog.confirm(modalOptions);
            modalInstance.result.then(function (modalResult) {
                if (modalResult==="Yes"){
                    var promises = [];
                    angular.forEach($scope.selectedDocuments, function(doc, key){ 
                        promises.push(Document.destroy($scope.selectedCollection.id, doc.id));
                    });

                    $q.all(promises)
                        .then(function(data) { 
                            initializeCollections();  
                            initializeCollectionData();
                            $scope.selectedCollectionIndex = $scope.selectedCollectionIndexTmp;
                        }); 
                } 
            });    
        };

        $scope.documentClick = function () {            //function to be called when a user clicks on table documents 
            $scope.selectedCollectionIndexTmp = $scope.selectedCollectionIndex;
            $scope.selectedDocuments = _.where($scope.collectionDocuments, {isSelected: true});
            if ($scope.selectedDocuments.length>0) 
                $scope.btnShow = false;
            else 
                $scope.btnShow = true;
        }

        initializeCollections();
    }]);
