'use strict';

angular.module('supportAdminApp')
    .factory('DeviceStatusService', ['$log', '$q', '$http', 'constants',
        function ($log, $q, $http, $const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var deviceStatusService = {};
            deviceStatusService.retrieveThresholdData = function () {
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/query/systemInfo',
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                return request.then(
                    function (response) {
                        if (response.data.code === 0) {
                            return response.data.data;
                        }
                        else {
                            return response.data.msg;
                        }
                    },
                    function (error) {
                        return $q.reject({ error: error });
                    }
                );
            };
            return deviceStatusService;
        }]);
