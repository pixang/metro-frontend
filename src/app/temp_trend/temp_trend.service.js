'use strict';

angular.module('supportAdminApp')
  .factory('TempTrendService', ['$log', '$q','$http', 'constants',
    function ($log, $q, $http, $const) {
      // local dev
      var API_URL = $const.API_URL;
      var TempTrendService = {};

      TempTrendService.retrieveTrendencyRecordForChart = function(searchCondition){
        var payload = JSON.stringify(searchCondition);

        var request = $http({
            method: 'POST',
            url: API_URL + "/query/tempTendency",
            headers: {
              "Content-Type":"application/json"
            },
            data:payload
        });
        return request.then(
            function(response) {
              if(response.data.code === 0){
                return TempTrendService.createRecordForChart(response.data.data.tempTendencyBos, searchCondition);
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

      TempTrendService.createRecordForChart = function(data, searchCondition){
        var result = {};
        result.trainDateForX =  [];
        result.temp = [];

        var strTime = "";
        for(var i = 0; i < data.length; i++){
          strTime = data[i].motorDate;
          result.trainDateForX.push(
              strTime.slice(0,4)+'-'+strTime.slice(4,6)+'-'+strTime.slice(6,8)+ ' '+ 
              strTime.slice(8,10)+ ':' + strTime.slice(10,12)+':'+strTime.slice(12,14)
          );
          result.temp.push(data[i].tempMax)
        }
        return result;
      };

      function fix_number(x) {
        return Number.parseFloat(x).toFixed(2);
      }
      return TempTrendService;
}]);
