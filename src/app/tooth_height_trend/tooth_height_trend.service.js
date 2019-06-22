'use strict';

angular.module('supportAdminApp')
  .factory('ToothHeightTrendService', ['$log', '$q','$http', 'constants',
    function ($log, $q, $http, $const) {
      // local dev
      var API_URL = $const.API_URL;

      var ToothHeightTrendService = {};

      ToothHeightTrendService.retrieveTrendencyRecord = function(searchCondition){
        var payload = JSON.stringify(searchCondition);

        var request = $http({
            method: 'POST',
            url: API_URL + '/analyze/gear/tendency',
            headers: {
              "Content-Type":"application/json"
            },
             data: payload
        });
        return request.then(
            function(response) {
              if(response.data.code === 0){
                return ToothHeightTrendService.createRecord(response.data.data);
              }
              else{
                return response.data.msg;
              }
            },
            function(error) {            
              return $q.reject({error : error});
            }
        );
      }
      ToothHeightTrendService.retrieveTrendencyRecordForChart = function(searchCondition){
        var payload = JSON.stringify(searchCondition);

        var request = $http({
            method: 'POST',
            url: API_URL + "/analyze/gear/tendency",
            headers: {
              "Content-Type":"application/json"
            },
            data:payload
        });
        return request.then(
            function(response) {
              if(response.data.code === 0){
                return ToothHeightTrendService.createRecordForChart(response.data.data, searchCondition);
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

      ToothHeightTrendService.createRecord = function(data){
          var result = [];
          var content = {};
          angular.forEach(data.list, function(elem){
            result = result.concat(ToothHeightTrendService.transferResult(elem));
          });
          content.result = result;
          content.pages =  data.pages;
          content.pageNum = data.pageNum; 
          return content;
      }

      ToothHeightTrendService.createRecordForChart = function(data, searchCondition){
        var result = {};
        result.trainDateForX =  [];
        result.leftGearForY_0 = [];
        result.rightGearForY_0 = [];
      
        result.leftGearForY_1 = [];
        result.rightGearForY_1 = [];
 
        var strTime = "";
        for(var i = 0; i < data.length; i++){

          strTime = data[i].trainDate;

          result.trainDateForX.push(
              strTime.slice(0,4)+'-'+strTime.slice(4,6)+'-'+strTime.slice(6,8)+ ' '+ 
              strTime.slice(8,10)+ ':' + strTime.slice(10,12)+':'+strTime.slice(12,14)
          );
          if(data[i].gearNum1 === searchCondition.gearNum1){
            result.leftGearForY_0.push( Number(data[i].leftGear1.toFixed(2) ));
            result.rightGearForY_0.push(Number(data[i].rightGear1.toFixed(2)));

            result.leftGearForY_1.push( Number(data[i].leftGear2.toFixed(2)));
            result.rightGearForY_1.push(Number(data[i].rightGear2.toFixed(2)));
          } else{
            result.leftGearForY_0.push( Number(data[i].leftGear2.toFixed(2)));
            result.rightGearForY_0.push(Number(data[i].rightGear2).toFixed(2));

            result.leftGearForY_1.push( Number(data[i].leftGear1).toFixed(2));
            result.rightGearForY_1.push(Number(data[i].rightGear1).toFixed(2));
          }     
        }
        return result;
      };
    

      ToothHeightTrendService.transferResult = function(elem){
        var Record = function() {};
        var records = [];
        var record = {};
        record.trainStation = elem.trainStation;
        record.trainId = elem.trainId;
        record.motorNum = elem.motorNum;
        record.trainDirection = elem.trainDirection === 0 ? "上行":"下行";
        record.trainDate = elem.trainDate.slice(0,4)+'-'+elem.trainDate.slice(4,6)+'-'+elem.trainDate.slice(6,8)+ ' '+
                            elem.trainDate.slice(8,10)+ ':' + elem.trainDate.slice(10,12)+':'+elem.trainDate.slice(12,14);
        record.gearNum = elem.gearNum1;
        record.leftGear = fix_number(elem.leftGear1);
        record.rightGear = fix_number(elem.rightGear1);

        records.push(angular.extend(new Record(), record));
        record.gearNum = elem.gearNum2;
        record.leftGear = fix_number(elem.leftGear2);
        record.rightGear = fix_number(elem.rightGear2);

        records.push(angular.extend(new Record(), record));
        return records;
      };

      function fix_number(x) {
        return Number.parseFloat(x).toFixed(2);
      }
      return ToothHeightTrendService;
}]);
