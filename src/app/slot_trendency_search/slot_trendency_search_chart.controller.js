'use strict';

var module = angular.module('supportAdminApp');

module.controller("SlotTrendencySearchChartController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','SlotTrendencyService','constants',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, slotTrendencyService,$const){


    // fixed data
    $scope.line = $const.LINE;
    $scope.station = $const.STATION;
    $scope.slots = $const.SLOT;
    $scope.motorNums = [1,2,3,4,5,6,7,8];
    $scope.trainIds = $const.TRAIN_ID;

    $scope.selectedItem  = null;
    $scope.inputTrainId  = "001002";
        $scope.querySearch = function(query) {
            if(query === "001002"){
                return $scope.trainIds;
            }else{
                return query ? $scope.trainIds.filter( createFilterFor(query)) : $scope.trainIds;
            }
        };
    $scope.selectedTrainIdChange = function(trainId) {
        $scope.formSearch.trainId = trainId;
    };
    $scope.searchInputChange = function(trainId) {
        $scope.formSearch.trainId = trainId;
    };
    function createFilterFor(query) {
        return function filterFn(trainIds) {
            return (trainIds.indexOf(query) === 0);
        };
    }
    $scope.OpenMenu = function(){
        $scope.inputTrainId = null;
    };

    $scope.formSearch = {
        startTime: new Date(new Date().getTime()- 24 * 60 * 60 * 1000),
        endTime: new Date(),
        trainId: "001002",
        trainDirection: "上行",
        motorNum:"1",
        firstSlot: "3",
        secondSlot: "78",
   
        pageNum: "",
        pageSize: "",
        isLoaded: false,
        isLoading: false,
        setLoaded: function(loaded) {
            this.isLoaded = loaded;
        },
        setLoading: function(loading) {
            this.isLoading = loading;
        }
    };

    $scope.dateTransfer = function(date){
        var Y = date.getFullYear(),
        M = date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : '' + (date.getMonth()+1),
        D = date.getDate()    < 10 ? '0'+(date.getDate()) : '' + (date.getDate()),
        h = date.getHours()   < 10 ? '0'+(date.getHours()) : '' + (date.getHours()),
        m = date.getMinutes() < 10 ? '0'+(date.getMinutes()) : '' + (date.getMinutes()),
        s = date.getSeconds() < 10 ? '0'+(date.getSeconds()) : '' + (date.getSeconds());
        return Y+M+D+h+m+s;
    };
    $scope.search = function() {
        $alert.clear();
        var err = [];
        var searchCondition = {};
        if ($scope.formSearch.startTime){
            searchCondition.startTime = $scope.dateTransfer($scope.formSearch.startTime);
        }else{
            err.push("起始时间不能为空");
        }
        if ($scope.formSearch.endTime){
            searchCondition.endTime = $scope.dateTransfer($scope.formSearch.endTime);
        } else{
            err.push("结束时间不能为空");
        }
        if ($scope.formSearch.trainId === "" || $scope.formSearch.motorNum ==="" || $scope.formSearch.trainDirection === ""
        || $scope.formSearch.motorNum ==="" || $scope.formSearch.firstSlot===""|| $scope.formSearch.secondSlot === ""){
            err.push("查询条件有误，请检查");
        }
        if(err.length > 0){
            $alert.error(err.join('! '));
            return
        }
        if(searchCondition.startTime > searchCondition.endTime){
            $alert.error("起始时间不能大于结束时间");
            return
        }
        if($scope.formSearch.firstSlot === $scope.formSearch.secondSlot){
            $alert.error("请勿输入相同的槽隙编号");
            return 
        }
        searchCondition.trainId = $scope.formSearch.trainId;
        searchCondition.trainDirection = $scope.formSearch.trainDirection === "上行" ? 0 : 1;
        searchCondition.motorNum = parseInt( $scope.formSearch.motorNum);
        searchCondition.firstSlot = parseInt(  $scope.formSearch.firstSlot );
        searchCondition.secondSlot = parseInt( $scope.formSearch.secondSlot);

        $scope.formSearch.setLoading(true);
        $scope.formSearch.setLoaded(false);

        slotTrendencyService.retrieveTrendencyRecordForChart(searchCondition).then(
            function(data){
                if(typeof(data) === "string"){
                    $alert.error(data);

                    $scope.formSearch.setLoading(false);
                    return
                }

                $scope.formSearch.setLoaded(true);
                $scope.formSearch.setLoading(false);

                $scope.trainDateForX = data.trainDateForX;
                $scope.lslotValueForY_0 = data.lslotValueForY_0;
                $scope.rslotValueForY_0 = data.rslotValueForY_0;
                $scope.lslotDepthForY_0 = data.lslotDepthForY_0;
                $scope.rslotDepthForY_0 = data.rslotDepthForY_0;
                
                $scope.lslotValueForY_1 = data.lslotValueForY_1;
                $scope.rslotValueForY_1 = data.rslotValueForY_1;
                $scope.lslotDepthForY_1 = data.lslotDepthForY_1;
                $scope.rslotDepthForY_1 = data.rslotDepthForY_1;
                if($scope.trainDateForX.length < 21){
                    $scope.tickInterval = 1;
                }else if($scope.trainDateForX.length < 42){
                    $scope.tickInterval = 2;
                }else if($scope.trainDateForX.length < 84){
                    $scope.tickInterval = 4;
                }else if($scope.trainDateForX.length < 178){
                    $scope.tickInterval = 8;
                }else{
                    $scope.tickInterval = 12;
                }

                $scope.$broadcast('SlotChartDataUpdated');
            },
            function(err){
                $scope.formSearch.setLoading(false);
            }
        )
    };

    $scope.$on('SlotChartDataUpdated', function(event){
        $timeout(function(){
            $rootScope.$broadcast('ResizePage');
        }, 100);
    });


    $scope.$on('SlotChartDataUpdated', function(event){
    
        var firstChart = null;
        firstChart = new Highcharts.Chart({
            chart: {
                renderTo: 'firstChart',
                type: 'spline',
                zoomType: 'x',
                marginRight: 100
            },
            title: {
                text: $scope.formSearch.motorNum + '号电机第' +$scope.formSearch.firstSlot + '槽隙高度趋势分析图'
            },
            xAxis: {
                categories: $scope.trainDateForX,
                tickInterval: $scope.tickInterval
            },
            yAxis: {
                title: {
                    text: '电机气隙高度'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                x : 6
            },
            series: [
                {
                    name: '左传感器槽高',
                    data: $scope.lslotValueForY_0
                },
                {
                    name: '右传感器槽高',
                    data: $scope.rslotValueForY_0
                },
                {
                    name: '左传感器槽深',
                    data: $scope.lslotDepthForY_0
                },
                {
                    name: '右传感器槽深',
                    data: $scope.rslotDepthForY_0
                }
            ],
            credits:{
                enabled: false 
            }
        });
        var secondChart = null;
        secondChart = new Highcharts.Chart({
            chart: {
                renderTo: 'secondChart',
                type: 'spline',
                zoomType: 'x',
                marginRight: 100
            },
            title: {
                text: $scope.formSearch.motorNum + '号电机第' +$scope.formSearch.secondSlot + '槽隙高度趋势分析图'
            },
            xAxis: {
                categories: $scope.trainDateForX,
                tickInterval: $scope.tickInterval
            },
            yAxis: {
                title: {
                    text: '电机气隙高度'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            series: [
                {
                    name: '左传感器槽高',
                    data: $scope.lslotValueForY_1
                },
                {
                    name: '右传感器槽高',
                    data: $scope.rslotValueForY_1
                },
                {
                    name: '左传感器槽深',
                    data: $scope.lslotDepthForY_1
                },
                {
                    name: '右传感器槽深',
                    data: $scope.rslotDepthForY_1
                }
            ],
            credits:{
                enabled: false 
            }
        });
    });

    angular.element(document).ready(function() {
        $rootScope.$broadcast("HideDashboard");
        $rootScope.$broadcast('ResizePage');
      });
}]);
