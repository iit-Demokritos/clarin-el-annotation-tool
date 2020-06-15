angular.module('clarin-el').controller('NavbarCtrl', ['$scope', '$state', 'User', 'Flash', function($scope, $state, User, Flash) {
    $scope.logout = function() {
        User.logout().then(function(response) {
            delete sessionStorage.authenticated;
            Flash.show(response.message);
            $state.go('welcome');
        }, function(error){
            delete sessionStorage.authenticated;
            Flash.show(error.message);
            $state.go('welcome');
        });
    };
}]);
