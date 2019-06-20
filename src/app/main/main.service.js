'use strict';

angular.module('supportAdminApp')
  .factory('MainService', ['$log', '$q','$http', 'constants',
    function ($log, $q, $http, $const) {

      var API_URL =  $const.API_URL;
      var MainService = {};
      MainService.retrieveTrainDetail = function(trainOnlyId) {

        var request = $http({
            method: 'GET',
            url: API_URL + '/' + trainOnlyId + '/' + 'traindetail',
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


      MainService.retrieveTrainInfo = function() {
        var request = $http({
            method: 'GET',
            url: API_URL + "/index/last",
            // url:"http://192.168.1.102:3006/data",
            headers: {
              "Content-Type":"application/json"
            }
        });
        return request.then(
            function(response) {
              var data = JSON.stringify(response.data);

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

        MainService.retrieveAllTrainInfo = function() {
            var request = $http({
                method: 'GET',
                url: API_URL + "/index/all",
                headers: {
                    "Content-Type":"application/json"
                }
            });
            return request.then(
                function(response) {
                    var data = JSON.stringify(response.data);

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

      MainService.changePassword = function(user) {
        var payload = JSON.stringify(user);
        console.log(payload);
        var request = $http({
            method: 'POST',
            url:  API_URL + '/' + 'user' + '/' + 'password',
            headers: {
              "Content-Type":"application/json"
            },
            data: payload
        });
        return request.then(
            function(response) {
              console.log(response);
              return response.data.code;
            },
            function(error) {
              return $q.reject({error : error});
            }
        );
      };

      MainService.retrieveTrainWarning = function(trainOnlyId) {

        var request = $http({
            method: 'GET',
            url: API_URL + '/warn' +'/'+  trainOnlyId,
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

      MainService.retrieveAbnormalState = function(trainOnlyId) {

        var request = $http({
            method: 'GET',
            url: API_URL + '/warn' +'/'+  trainOnlyId,
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

        MainService.triggerLight = function(status) {
            console.log("触发灯:  ", status);
            $http({
                method: 'GET',
                url: API_URL + '/deviceState' + '/' + status,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        };
        MainService.clockLight = function(){
            console.log("关闭灯:  ");

            $http({
                method: 'GET',
                url: API_URL + '/getmapping/nowtime',
                headers: {
                    "Content-Type": "application/json"
                }
            })
        };

      MainService.retrieveCurrentDayData = function() {
        var date = dateTransfer(new Date());
        var request = $http({
            method: 'GET',
            url: API_URL + "/today/qiximin/" + date,
            headers: {
              "Content-Type":"application/json"
            }
        });
        return request.then(
            function(response) {
              if(response.data.code === 0){
                return MainService.createRecord(response.data.data);
              }
              else{
                return response.data.msg;
              }

              return response.data;
            },
            function(error) {
              return $q.reject({error : error});
            }
          );
      };
      function dateTransfer(date){
          var Y = date.getFullYear(),
              M = date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : '' + (date.getMonth()+1),
              D = date.getDate()    < 10 ? '0'+(date.getDate()) : '' + (date.getDate());
          return Y + M + D + '000000';
      }


        MainService.createRecord = function(data){
        var result = [];
        var content = {};
        angular.forEach(data, function(elem){
          result = result.concat(MainService.transferResult(elem));
        });
        content.result = result;
        return content;
    };

    MainService.transferResult = function(elem){
      var Record = function() {};
      var records = [];
      var record = {};
      record.trainId = elem.trainId;
        record.trainOnlyid = elem.trainOnlyid;
        record.trainDirection = elem.trainDirection;

        record.motorNum = elem.motorNum;
      record.controlNum = elem.controlNum;

      record.trainDate = elem.trainDate.slice(0,4)+'-'+elem.trainDate.slice(4,6)+'-'+elem.trainDate.slice(6,8)+ ' '+ 
                          elem.trainDate.slice(8,10)+ ':' + elem.trainDate.slice(10,12)+':'+elem.trainDate.slice(12,14);
      record.gapminVal = fix_number(elem.gapminVal);
      record.slgapMin = fix_number(elem.slgapMin);
      record.srgapMin = fix_number(elem.srgapMin);
      record.tempMax = fix_number(elem.tempMax);
      record.tempMin = fix_number(elem.tempMin);
      record.tlgapMin = fix_number(elem.tlgapMin);
      record.trgapMin = fix_number(elem.trgapMin);

      records.push(angular.extend(new Record(), record));
      return records;
    };

    function fix_number(x) {
      return Number.parseFloat(x).toFixed(2);
    }
      return MainService;
    }
]);
