hitchable.controller('contactController', ['$cookies', '$http', '$scope', '$rootScope', 'userFactory', 'config', 
	function($cookies, $http, $scope, $rootScope, userFactory, config){
	init();
	function init(){

		$rootScope.pageTitle = 'Rdvouz - Dashboard - Contact information';
		$rootScope.pageLink = 'dashboard/contact';
		$rootScope.pageDescription = "Manage all of your contact information here";

		//GET USER DATA
		userFactory.getUserData(function(err, data){
			if (err) {
				alert('server error, try again'); 
			} else {
				$scope.usernameCookie = $cookies.userNameCookie;
				$scope.contactNav = 'active';
				$scope.userData = data;
				$scope.sex = [
				      {name:'Male', value:'male'},
				      {name:'Female', value:'female'},
				    ];
				if ($scope.userData.img) { 
					$scope.image = true
				} else {
					$scope.image = false
				}
			}
		});
		mixpanel.track("Visited Contact");
	}

	//SUBMIT EMAIL AND PHONE
	$scope.contactSubmit =  function(email, phone){
		var json = {email : email, phone : phone};
		$http.post(config.remoteServer + '/dashboard/profile/contact' + config.tokenString(), json)
			.success(function(data){
				$scope.userContact = true;
			})
			.error(function(data){
				alert('server error, try again'); return;
			})
	};

	//CHANGE PRIVACY OPTIONS
	$scope.setOptions = function(){
		var privacyOptions = {
			show_phone: $scope.userData.show_phone,
			show_facebook: $scope.userData.show_facebook
		}
		userFactory.changeContactPreferences( privacyOptions , function(err, optionData){
			if (err) {alert('server error, try again'); return;}
		});
	}
}]);