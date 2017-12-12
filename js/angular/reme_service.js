var services = angular.module('reme.services', []);

	services.factory('apiService', function($http, API_URL) {
		var remeApi = {};
		var remeUrl = API_URL + '/api';

		remeApi.login = function(data) {
			return $http({
				method 	: 'POST'
				, data 	: data
				, url 	: remeUrl + '/login'
			});
		}

		remeApi.getUser = function() {
			return $http({
				method 	: 'GET'
				, url 	: remeUrl + '/user'
			});
		}

		remeApi.getClientList = function(data) {
			return $http({
				method 	: 'GET',
				url 	: remeUrl + '/manage/users?limit=20&offset=0'
			});
		}

		return remeApi;
	});