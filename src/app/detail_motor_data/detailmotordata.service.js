'use strict';

angular.module('supportAdminApp')
    .factory('DetailMotorDataService', ['$log', '$q','$http', 'constants',
        function ($log, $q, $http,$const) {
            // local dev
            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var DetailMotorDataService = {};

            DetailMotorDataService.retrieveRecord = function(searchCondition){
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/' + searchCondition.trainOnlyid + '/' + searchCondition.trainDirection + '/' + 'motordetail',
                    headers: {
                        "Content-Type":"application/json"
                    }
                });
                return request.then(
                    function(response) {
                        if(response.data.code === 0){
                            return DetailMotorDataService.createRecord(response.data.data);
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

            DetailMotorDataService.createRecord = function(data){
                var result = [];
                var content = {};
                angular.forEach(data.motorVOList, function(elem){
                    result = result.concat(DetailMotorDataService.transferResult(elem));
                });
                content.result = result;
                content.controlNum =  data.controlNum;
                content.trainDirection = data.trainDirection == 0 ? "上行":"下行";
                content.trainState =  trainState[data.trainState - 1];
                content.trainId =  data.trainId;
                content.trainOnlyid =  data.trainOnlyid;

                return content;
            };

            DetailMotorDataService.transferResult = function(elem){
                var Record = function() {};
                var records = [];
                var record = {};

                record.lgapMin = fix_number(elem.lgapMin);
                record.rgapMin = fix_number(elem.rgapMin);
                record.lgapStatus = elem.lgapStatus;
                record.rgapStatus = elem.rgapStatus;

                record.lslotMin = fix_number(elem.lslotMin);
                record.lslotMinStatus = elem.lslotMinStatus;

                record.rslotMin = fix_number(elem.rslotMin);
                record.rslotMinStatus = elem.rslotMinStatus;

                record.lslothMax = fix_number(elem.lslothMax);
                record.lslothMaxStatus = elem.lslothMaxStatus;

                record.rslothMax = fix_number(elem.rslothMax);
                record.rslothMaxStatus = elem.rslothMaxStatus;

                record.lslotMax = fix_number(elem.lslotMax);
                record.lslotMaxStatus = elem.lslotMaxStatus;

                record.rslotMax = fix_number(elem.rslotMax);
                record.rslotMaxStatus = elem.rslotMaxStatus;

                record.tempMax = fix_number(elem.tempMax);
                record.tempMaxStatus = elem.tempMaxStatus;

                record.rpilotValue = fix_number(elem.rpilotValue);
                record.rpilotStatus = elem.rpilotStatus;
                record.lpilotValue = fix_number(elem.lpilotValue);
                record.lpilotStatus = elem.lpilotStatus;


                record.motorSpeed = fix_number(elem.motorSpeed);
                record.excStatus = elem.excStatus;
                record.excValue = fix_number(elem.excValue);
                records.push(angular.extend(new Record(), record));
                return records;
            };


            DetailMotorDataService.retrieveGearRecord = function(searchCondition){
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/' + searchCondition.trainOnlyid + '/' + searchCondition.trainDirection + '/' +  searchCondition.motorNum + '/' + 'geardetail',
                    headers: {
                        "Content-Type":"application/json"
                    }
                });
                return request.then(
                    function(response) {
                        if(response.data.code === 0){
                            return DetailMotorDataService.createGearRecord(response.data.data);
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

            DetailMotorDataService.createGearRecord = function(data){
                var result = [];
                var content = {};
                angular.forEach(data, function(elem){
                    result = result.concat(DetailMotorDataService.transferGearResult(elem));
                });
                content.result = result;
                return content;
            };

            DetailMotorDataService.transferGearResult = function(elem){
                var Record = function() {};
                var records = [];
                var record = {};

                record.gearNum = elem.gearNum;
                record.lgapStatus = elem.lgapStatus;
                record.lgapValue = fix_number(elem.lgapValue);
                record.lslotDepth = fix_number(elem.lslotDepth);
                record.lslotStatus = elem.lslotStatus;
                record.lslotValue = fix_number(elem.lslotValue);
                record.lslotdStatus = elem.lslotdStatus;

                record.rgapStatus = elem.rgapStatus;
                record.rgapValue = fix_number(elem.rgapValue);
                record.rslotDepth = fix_number(elem.rslotDepth);
                record.rslotStatus = elem.rslotStatus;
                record.rslotValue = fix_number(elem.rslotValue);
                record.rslotdStatus = elem.rslotdStatus;

                records.push(angular.extend(new Record(), record));
                return records;
            };

            DetailMotorDataService.retrieveLaserRecord = function(searchCondition){
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/' + searchCondition.trainOnlyid + '/' + searchCondition.trainDirection + '/' +  searchCondition.motorNum + '/' + 'laser',
                    headers: {
                        "Content-Type":"application/json"
                    }
                });
                return request.then(
                    function(response) {
                        var data = JSON.stringify(response);
                        if(response.data.code == 0){
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
            DetailMotorDataService.createLaserRecord = function(data){
                var Record = function() {};
                var records = [];

                var left = [];
                var right = [];
                var content = {};
                angular.forEach(data.map.left, function(elem){
                    if(elem < 29 && elem>20){
                        left.push(elem);
                    }
                });
                angular.forEach(data.map.right, function(elem){
                    if(elem < 29 && elem>20){
                        right.push(elem);
                    }
                });
                content.left = left;
                content.right = right;

                content.result = data.gapWarn;
                records.push(angular.extend(new Record(), content));

                return records[0];
            };
            // DetailMotorDataService.createLaserRecord = function(data){
            //     var result = [];
            //     var content = {};
            //     content.result = DetailMotorDataService.transferLaserResult(data.map);
            //     content.gapWarn = data.gapWarn;
            //     return content;
            // }
            DetailMotorDataService.transferLaserResult = function(elem){
              
                var left = [];
                var right = [];
                
                if(elem < 29 && elem>20){
                    return elem;
                }else{
                    return -1;
                }
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            return DetailMotorDataService;
        }]);
