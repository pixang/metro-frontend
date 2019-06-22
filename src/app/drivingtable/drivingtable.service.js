'use strict';

angular.module('supportAdminApp')
    .factory('DrivingTableService', ['$log', '$q','$http', 'constants',
        function ($log, $q, $http, $const) {

            var API_URL = $const.API_URL;
            var trainState = $const.TRAIN_STATE;

            var DrivingTableService = {};

            DrivingTableService.retrieveRecord = function(searchCondition){
                var request = $http({
                    method: 'GET',
                    url: API_URL + '/table/report/' + searchCondition.pre + '/' + searchCondition.page + '/' + searchCondition.pageSize,
                    headers: {
                        "Content-Type":"application/json"
                    }
                });

                return request.then(
                    function(response) {
                        if(response.data.code === 0){
                            return DrivingTableService.createRecord(response.data.data);
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

            DrivingTableService.createRecord = function(data){
                var result = [];
                var content = {};
                angular.forEach(data.list, function(elem){
                    result = result.concat(DrivingTableService.transferResult(elem));
                });
                content.result = result;
                content.pages =  data.pages;
                content.pageNum = data.pageNum;
                return content;
            };

            DrivingTableService.transferResult = function(elem){
                var Record = function() {};
                var records = [];
                var record = {};

                record.trainId = elem.trainId;
                record.controlNum = elem.controlNum;
                record.trainDirection = elem.trainDirection == 0 ? "上行":"下行";

                record.lgapMin = elem.lgapMin ? elem.lgapMin : '无数据';
                record.rgapMin = elem.rgapMin ? elem.rgapMin : '无数据';

                record.lslotMin = elem.lslotMin ? elem.lslotMin : '无数据';
                record.rslotMin = elem.rslotMin ? elem.rslotMin : '无数据';

                record.lslotMax = elem.lslotMax ? elem.lslotMax : '无数据';
                record.rslotMax = elem.rslotMax ? elem.rslotMax : '无数据';
                record.rslotMaxStatus = elem.rslotMaxStatus;
                record.lslotMaxStatus = elem.lslotMaxStatus;
                record.lslothMax = elem.lslothMax ? elem.lslothMax : '无数据';
                record.rslothMax = elem.rslothMax ? elem.rslothMax : '无数据';
                record.rslothMaxStatus = elem.rslothMaxStatus;
                record.lslothMaxStatus = elem.lslothMaxStatus;
                record.lpilotMin = elem.lpilotMin ? elem.lpilotMin : '无数据';
                record.rpilotMin = elem.rpilotMin ? elem.rpilotMin : '无数据';
                record.lpilotMinStatus = elem.lpilotMinStatus;
                record.rpilotMinStatus = elem.rpilotMinStatus;
                record.trainState = trainState[elem.trainState - 1];
                record.lgapStatus = elem.lgapStatus;
                record.rgapStatus = elem.rgapStatus;
                record.rslotStatus = elem.rslotStatus;
                record.lslotStatus = elem.lslotStatus;


                record.trainDate = elem.trainDate.slice(0,4)+'-'+elem.trainDate.slice(4,6)+'-'+elem.trainDate.slice(6,8)+ ' '+
                    elem.trainDate.slice(8,10)+ ':' + elem.trainDate.slice(10,12)+':'+elem.trainDate.slice(12,14);

                record.tempAverage = elem.tempAverage ? fix_number(elem.tempAverage) : '无数据';

                record.trainOnlyid = elem.trainOnlyid;

                records.push(angular.extend(new Record(), record));
                return records;
            };

            function fix_number(x) {
                return Number.parseFloat(x).toFixed(2);
            }
            return DrivingTableService;
        }]);
