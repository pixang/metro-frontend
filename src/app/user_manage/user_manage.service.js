'use strict';

angular.module('supportAdminApp')
    .factory('UserManageService', ['$log', '$q','$http', 'constants',
        function ($log, $q, $http, $const) {
            var API_URL = $const.API_URL;
            var UserManageService = {};

            UserManageService.retrieveUser = function(){

                var request = $http({
                    method: 'GET',
                    url: API_URL + '/user/allusers',
                    headers: {
                        "Content-Type":"application/json"
                    }
                });
                return request.then(
                    function(response) {
                        if(response.data.code === 0){
                            return response.data.data;
                        }
                        else{
                            return response.data.msg;
                        }
                    },
                    function(error) {
                        return $q.reject({error : error});
                    }
                );
            };


            UserManageService.saveUser = function(user){
                var payload = JSON.stringify(user);
                console.log('payload: ', payload)
                var request = $http({
                    method: 'PUT',
                    url: API_URL + '/user/update',
                    headers: {
                        "Content-Type":"application/json"
                    },
                    data: payload
                });

                return request.then(
                    function(response) {
                        console.log(response)
                        if(response.data.code === 0){
                            return response.data.data;
                        }
                        else{
                            return response.data.msg;
                        }
                    },
                    function(error) {
                        return $q.reject({error : error});
                    }
                );
            };
            return UserManageService;
        }]);
