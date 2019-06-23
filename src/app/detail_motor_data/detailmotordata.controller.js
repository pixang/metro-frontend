'use strict';

var module = angular.module('supportAdminApp');

module.controller('DetailMotorDataController', [
  '$log', '$scope', '$rootScope', '$stateParams','$timeout', '$state', '$uibModal', 'Alert','constants','DetailMotorDataService',
    function ($log, $scope, $rootScope,$stateParams, $timeout, $state, $modal, $alert,$const,detailMotorDataService) {
        $scope.hideDetailMotorData = false;
        $scope.showMotorWave = false;
        $scope.showMotorTable = false;

        $scope.$on('DetailMotorDataUpdated', function(event){
            $('.footable-for-motor').footable({ paginate:false });
            $timeout(function(){
                $('.footable-for-motor').trigger('footable_redraw');
            },100);
        });

        $scope.$on('DetailMotorGearRecordsUpdated', function(event){
            $('.footable-for-gear').footable({ paginate:false });
            $timeout(function(){
                $('.footable-for-gear').trigger('footable_redraw');
            },100);
        });

        $scope.$on("ShowDashboard", function () {
            $scope.hideDetailMotorData = true;
        });

        $scope.$on("HideDashboard", function () {
            $scope.hideDetailMotorData = false;
        });

        $scope.$on("ShowDetailMotorData", function () {
            $scope.hideDetailMotorData = false;
            $scope.showMotorWave = false;
            $scope.showMotorTable = false;

            $scope.$broadcast('DetailMotorDataUpdated');
        });

        $scope.backFromDetailMotorPage = function() {
            $state.go('index.main');
        };

        $scope.backFromMotorWave = function() {
            $rootScope.$broadcast("ShowDetailMotorData");
        };
        $scope.backFromMotorTable = function() {
            $rootScope.$broadcast("ShowDetailMotorData");
        };

        $scope.getMotorWave = function(index) {
            $scope.formSearch.motorNum = index + 1;
            $scope.searchLaserDate($stateParams.trainOnlyId, $stateParams.trainDirection , $scope.formSearch.motorNum);

            $scope.hideDetailMotorData = true;
            $scope.showMotorWave =true;
        };
        $scope.getMotorTable = function(index) {
            $scope.formSearch.motorNum = index + 1;
            $scope.searchGearDate($stateParams.trainOnlyId, $stateParams.trainDirection , $scope.formSearch.motorNum);
            
            $scope.hideDetailMotorData = true;
            $scope.showMotorTable =true;
        };

        $scope.motorNums = [1,2,3,4,5,6,7,8];
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.formSearch = {
            motorNum : '',
            isLoaded : false,
            isLoading : false,
            setLoaded: function(loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function(loading) {
                this.isLoading = loading;
            }
        };
        $scope.trainDate = $stateParams.trainDate;
        $scope.search = function(trainOnlyId, trainDirection) {
            $alert.clear();

            if (trainOnlyId == null || trainDirection == null){
                $alert.error("数据已丢失，请从主页面重新选择！");
                return 
            }
            var searchCondition = {};
            searchCondition.trainOnlyid = trainOnlyId;
            searchCondition.trainDirection = trainDirection;
            
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            detailMotorDataService.retrieveRecord(searchCondition).then(
                function(data){
                    if(typeof(data) == "string"){
                        $alert.error(data);
                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.detailMotorRecords = data;
                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                    $scope.$broadcast('DetailMotorDataUpdated');
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.detailMotorRecords = [];

        $scope.searchGearDate = function(trainOnlyId, trainDirection,motorNum) {
            $alert.clear();
            var err = [];

            if (trainOnlyId == null || trainDirection == null || motorNum == null){
                $alert.error("请返回并重新选择车号！");
                return 
            }
            var searchCondition = {};
            searchCondition.trainOnlyid = trainOnlyId;
            searchCondition.trainDirection = trainDirection;
            searchCondition.motorNum = motorNum;

            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);
            detailMotorDataService.retrieveGearRecord(searchCondition).then(
                function(data){
                    if(typeof(data) === "string"){
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.detailMotorGearRecords = data.result;

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.$broadcast('DetailMotorGearRecordsUpdated');
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.detailMotorGearRecords = [];

        $scope.searchLaserDate = function(trainOnlyId, trainDirection,motorNum) {
            $alert.clear();
            var err = [];

            if (trainOnlyId == null || trainDirection == null || motorNum == null){
                $alert.error("此页面不可刷新，请返回并重新选择！");
                return 
            }
            var searchCondition = {};
            searchCondition.trainOnlyid = trainOnlyId;
            searchCondition.trainDirection = trainDirection;
            searchCondition.motorNum = motorNum;

            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);
            detailMotorDataService.retrieveLaserRecord(searchCondition).then(
                function(data){
                    if(typeof(data) == "string"){
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.left = [];
                    $scope.right = [];
                    $scope.detailMotorLaserRecords = data;
                    // $scope.gapWarn = $scope.detailMotorLaserRecords.gapWarn;

                    var lowerLimit = $scope.detailMotorLaserRecords.lowerLimit;
                    var upperLimit  =$scope.detailMotorLaserRecords.upperLimit;

                    for(var i = 0; i<data.map.left.length; i++){
                        if(data.map.left[i]  < upperLimit && data.map.left[i] > lowerLimit){
                            $scope.left.push(Number(data.map.left[i].toFixed(2)));
                        }
                    }
                    for(var i = 0; i<data.map.right.length; i++){
                        if(data.map.right[i]  < upperLimit && data.map.right[i] > lowerLimit){
                            $scope.right.push(Number(data.map.right[i].toFixed(2)));
                        }
                    }
                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.$broadcast('DetailMotorLaserRecordsUpdated');
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.detailMotorLaserRecords = [];
        $scope.left = [];
        $scope.right = [];

        $scope.$on('DetailMotorLaserRecordsUpdated', function(event){
                $rootScope.$broadcast('ResizePage');
        });
    
        $scope.$on('DetailMotorLaserRecordsUpdated', function(event){
            var firstChart = null;
            firstChart = new Highcharts.Chart({
                chart: {
                    renderTo: 'firstChart',
                    type: 'spline',
                    zoomType: 'x',
                    marginRight: 0,
                },
                title: {
                    text: '电机气隙左传感器波形图'
                },
                xAxis: {
                    categories: $scope.trainDateForX,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    tickInterval:2,

                    min: $scope.detailMotorLaserRecords.lowerLimit,
                    max: $scope.detailMotorLaserRecords.upperLimit,
                    title: {
                        text: '左传感器波形'
                    },
                    plotLines: [
                        {
                            color: 'red',
                            'dashStyle': 'solid',
                            value: $scope.detailMotorLaserRecords.gapWarn,
                            width: 2
                        },
                        {
                            color: 'red',
                            'dashStyle': 'solid',
                            value: 27,
                            width: 2
                        }]
        
                },
                exporting: {
                    enabled: true
                },
                series: [
                    {
                        name: '左传感器槽高数据',
                        data: $scope.left
                    }
                ]
            });
    
            var secondChart = null;
            secondChart = new Highcharts.Chart({
                chart: {
                    renderTo: 'secondChart',
                    type: 'spline',
                    zoomType: 'x',
                    marginRight: 0
                },
                title: {
                    text: '电机气隙右传感器波形图'
                },
                xAxis: {
                    categories: $scope.trainDateForX,
                    tickInterval: $scope.tickInterval
                },
                yAxis: {
                    tickInterval:2,

                    min: $scope.detailMotorLaserRecords.lowerLimit,
                    max: $scope.detailMotorLaserRecords.upperLimit,
                    title: {
                        text: '右传感器波形'
                    },
                    plotLines: [
                        {
                            color: 'red',
                            'dashStyle': 'solid',
                            value: $scope.detailMotorLaserRecords.gapWarn,
                            width: 2
                        },
                        {
                            color: 'red',
                            'dashStyle': 'solid',
                            value: 27,
                            width: 2
                        }]
                },
                exporting: {
                    enabled: true
                },
                series: [
                    {
                        name: '右传感器槽高数据',
                        data: $scope.right
                    }
                ]
            });
        });

        $scope.exportMotorData = function(){
            var csvString = "线路,车号,主控端,站点,安装点,状态,行车时间,电机号,左齿最低高度,右齿最低高度,左槽隙最低深度,右槽隙最低深度,左槽楔最大,右槽楔最大,左排障器高度,右排障器高度," +
                "左槽隙最大深度,右槽隙最大深度,最大温度,速度,四角差值" + "\n";

            var raw_table = $scope.detailMotorRecords.result;
            for ( var idx=0, len = raw_table.length; idx<len; idx++) {
                csvString  = csvString + "4," + "\'" + $scope.detailMotorRecords.trainId + "\'" + "," + $scope.detailMotorRecords.controlNum + "," + "飞沙角,"
                    + $scope.detailMotorRecords.trainDirection + "," +  $scope.detailMotorRecords.trainState   + ","
                    + $scope.trainDate + "," + (idx+1) + ","
                    + raw_table[idx].lgapMin + "," + raw_table[idx].rgapMin + "," + raw_table[idx].lslotMin + "," + raw_table[idx].rslotMin + ","
                    + raw_table[idx].lslothMax + "," + raw_table[idx].rslothMax + "," + raw_table[idx].lpilotValue + "," + raw_table[idx].rpilotValue + ","
                    + raw_table[idx].lslotMax + "," + raw_table[idx].rslotMax + ","
                    + raw_table[idx].tempMax + "," + raw_table[idx].motorSpeed + "," + raw_table[idx].excValue;

                csvString = csvString.substring(0,csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);

            var file_name = $scope.detailMotorRecords.trainId + "_" + $scope.trainDate + "_电机报表.csv";
            var a = $('<a/>', {
                style:'display:none',
                href:'data:application/octet-stream;base64,'+ btoa(unescape(encodeURIComponent(csvString))),
                download:file_name
            }).appendTo('body');
            a[0].click();
            a.remove();
        };
        $scope.exportMotorGearData = function(){
            var csvString = "线路,车号,主控端,站点,安装点,状态,行车时间,齿号,左齿数值,右齿数值,左槽深数值,右槽深数值,左槽高数值,右槽高数值" + "\n";
            
            var raw_table = $scope.detailMotorGearRecords;
            for ( var idx=0, len = raw_table.length; idx<len; idx++) {
                
                    csvString  = csvString + "4," +"\'" +$scope.detailMotorRecords.trainId + "\'" + "," + $scope.detailMotorRecords.controlNum + "," + "飞沙角,"
                                                  + $scope.detailMotorRecords.trainDirection + "," +  $scope.detailMotorRecords.trainState   + ","
                                                  + $scope.trainDate + ","  + raw_table[idx].gearNum + "," + raw_table[idx].lgapValue + ","
                                                  + raw_table[idx].rgapValue + "," + raw_table[idx].lslotDepth + ","
                                                  + raw_table[idx].rslotDepth + "," + raw_table[idx].lslotValue + "," + raw_table[idx].rslotValue + ",";
                    
                    csvString = csvString.substring(0,csvString.length - 1);
                    csvString = csvString + "\n";
                
                
            }
            csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var download_name = "第" + $scope.formSearch.motorNum + "号电机报表.csv";
            var a = $('<a/>', {
                style:'display:none',
                href:'data:application/octet-stream;base64,'+ btoa(unescape(encodeURIComponent(csvString))),
                download:download_name
            }).appendTo('body');
            a[0].click();
            a.remove();
        };

        $scope.onChange = function(){
            $scope.searchGearDate($stateParams.trainOnlyId , $stateParams.trainDirection,$scope.formSearch.motorNum);
        };
        $scope.onChangeInChart = function(){
            $scope.searchLaserDate($stateParams.trainOnlyId , $stateParams.trainDirection,$scope.formSearch.motorNum);
        };

        angular.element(document).ready(function() {
            $rootScope.$broadcast("HideDashboard");
            $timeout(function(){
                $scope.search($stateParams.trainOnlyId , $stateParams.trainDirection); 
            },300);
            $('.footable-for-gear').footable({ paginate:false });
            $('.footable-for-motor').footable({ paginate:false });
        });
    }
]);
