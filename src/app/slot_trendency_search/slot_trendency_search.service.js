'use strict';

angular.module('supportAdminApp')
  .factory('SlotTrendencyService', ['$log', '$q','$http','constants',
    function ($log, $q, $http, $const) {

      var API_URL = $const.API_URL;
      var SlotTrendencyService = {};

      SlotTrendencyService.retrieveTrendencyRecord = function(searchCondition){
          var payload = JSON.stringify(searchCondition);

        var request = $http({
            method: 'POST',
            url: API_URL + '/analyze/slot/tendency',
            headers: {
              "Content-Type":"application/json"
            },
             data: payload
        });
        return request.then(
            function(response) {
              if(response.data.code == 0){
                return SlotTrendencyService.createRecord(response.data.data);
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

      SlotTrendencyService.retrieveTrendencyRecordForChart = function(searchCondition){
        var payload = JSON.stringify(searchCondition);

        var request = $http({
            method: 'POST',
            url: API_URL + '/analyze/slot/tendency',
            headers: {
              "Content-Type":"application/json"
            },
            data: payload
        });
        return request.then(
            function(response) {
              if(response.data.code == 0){
                return SlotTrendencyService.createRecordForChart(response.data.data, searchCondition);
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

      SlotTrendencyService.createRecord = function(data){
          var result = [];
          var content = {};
          angular.forEach(data.list, function(elem){
            result = result.concat(SlotTrendencyService.transferResult(elem));
          });
          content.result = result;
          content.pages =  data.pages;
          content.pageNum = data.pageNum; 
          return content;
      };

      SlotTrendencyService.createRecordForChart = function(data, searchCondition){
        if(angular.isArray(data)) {
          var result = {};
          result.trainDateForX =  [];
          result.lslotValueForY_0 = [];
          result.rslotValueForY_0 = [];
          result.lslotDepthForY_0 = [];
          result.rslotDepthForY_0 = [];

          result.lslotValueForY_1 = [];
          result.rslotValueForY_1 = [];
          result.lslotDepthForY_1 = [];
          result.rslotDepthForY_1 = [];
          var strTime = "";
          for(var i = 0; i < data.length; i++){

            strTime = data[i].trainDate;

            result.trainDateForX.push(
                strTime.slice(0,4)+'-'+strTime.slice(4,6)+'-'+strTime.slice(6,8)+ ' '+ 
                strTime.slice(8,10)+ ':' + strTime.slice(10,12)+':'+strTime.slice(12,14)
            );
            if(data[i].slotVOList[0].gearNum == searchCondition.firstSlot){
              result.lslotValueForY_0 .push(Number(data[i].slotVOList[0].lslotValue.toFixed(2)));
              result.rslotValueForY_0 .push(Number(data[i].slotVOList[0].rslotValue.toFixed(2)));
              result.lslotDepthForY_0 .push(Number(data[i].slotVOList[0].lslotDepth.toFixed(2)));
              result.rslotDepthForY_0 .push(Number(data[i].slotVOList[0].rslotDepth.toFixed(2)));

              result.lslotValueForY_1 .push(Number(data[i].slotVOList[1].lslotValue.toFixed(2)));
              result.rslotValueForY_1 .push(Number(data[i].slotVOList[1].rslotValue.toFixed(2)));
              result.lslotDepthForY_1 .push(Number(data[i].slotVOList[1].lslotDepth.toFixed(2)));
              result.rslotDepthForY_1 .push(Number(data[i].slotVOList[1].rslotDepth.toFixed(2)));
            } else{
              result.lslotValueForY_0 .push(Number(data[i].slotVOList[1].lslotValue.toFixed(2)));
              result.rslotValueForY_0 .push(Number(data[i].slotVOList[1].rslotValue.toFixed(2)));
              result.lslotDepthForY_0 .push(Number(data[i].slotVOList[1].lslotDepth.toFixed(2)));
              result.rslotDepthForY_0 .push(Number(data[i].slotVOList[1].rslotDepth.toFixed(2)));

              result.lslotValueForY_1 .push(Number(data[i].slotVOList[0].lslotValue.toFixed(2)));
              result.rslotValueForY_1 .push(Number(data[i].slotVOList[0].rslotValue.toFixed(2)));
              result.lslotDepthForY_1 .push(Number(data[i].slotVOList[0].lslotDepth.toFixed(2)));
              result.rslotDepthForY_1 .push(Number(data[i].slotVOList[0].rslotDepth.toFixed(2)));
            }     
          }
          return result;
        }
      };

      SlotTrendencyService.transferResult = function(elem){
        var Record = function() {};
        var records = [];
        var record = {};
        record.trainId = elem.trainId;
        record.motorNum = elem.motorNum;
        record.trainDirection = elem.trainDirection == 0 ? "上行":"下行";
        record.trainDate = elem.trainDate.slice(0,4)+'-'+elem.trainDate.slice(4,6)+'-'+elem.trainDate.slice(6,8)+ ' '+
                            elem.trainDate.slice(8,10)+ ':' + elem.trainDate.slice(10,12)+':'+elem.trainDate.slice(12,14);
        record.gearNum = elem.slotVOList[0].gearNum;
        record.lslotValue = fix_number(elem.slotVOList[0].lslotValue);
        record.rslotValue = fix_number(elem.slotVOList[0].rslotValue);
        record.lslotDepth = fix_number(elem.slotVOList[0].lslotDepth);
        record.rslotDepth = fix_number(elem.slotVOList[0].rslotDepth);

        records.push(angular.extend(new Record(), record));
        record.gearNum = elem.slotVOList[1].gearNum;
        record.lslotValue = fix_number(elem.slotVOList[1].lslotValue);
        record.rslotValue = fix_number(elem.slotVOList[1].rslotValue);
        record.lslotDepth = fix_number(elem.slotVOList[1].lslotDepth);
        record.rslotDepth = fix_number(elem.slotVOList[1].rslotDepth);

        records.push(angular.extend(new Record(), record));
        return records;
      };

      function fix_number(x) {
        return Number.parseFloat(x).toFixed(2);
      }
      return SlotTrendencyService;
}]);
