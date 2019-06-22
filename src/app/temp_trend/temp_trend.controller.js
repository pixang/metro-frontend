'use strict';

var module = angular.module('supportAdminApp');

module.controller("TempTrendController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','TempTrendService','constants',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, tempTrendService, $const){
    angular.element(document).ready(function () {
        $('.footable').footable({ paginate:false });
    });
      
    $scope.$on('GearTableDataUpdated', function(){
        $timeout(function(){
            $rootScope.$broadcast('ResizePage');
        }, 900);
        $timeout(function(){
            $('.footable').trigger('footable_redraw');
        }, 100);
    });

    $scope.selectedItem  = null;
    $scope.inputTrainId = "001002";
    $scope.querySearch = function(query) {
        if(query === "001002"){
            return $scope.trainIds;
        }else{
            return query ? $scope.trainIds.filter( createFilterFor(query)).concat($scope.trainIds) : $scope.trainIds;
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
    // fixed data
    $scope.line =$const.LINE;
    $scope.station = $const.STATION;
    // $scope.gears = $const.GEAR;
    $scope.motorNums = [1,2,3,4,5,6,7,8];
    $scope.trainIds = $const.TRAIN_ID;
    $scope.pageSizes = [
        { name: '10', value: '5' }, 
        { name: '20', value: '10' }, 
        { name: '30', value: '15' },
        { name: '40', value: '20' },
        { name: '60', value: '30' },
        { name: '80', value: '40' },
        { name: '200', value: '100' }
    ];

    $scope.formSearch = {
        startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        endTime: new Date(),
        trainId: "001002",
        trainDirection: "上行",
        motorNum:"1",
   
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


    $scope.searchForChart = function() {
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
        if ($scope.formSearch.trainId == "" || $scope.formSearch.motorNum =="" || $scope.formSearch.trainDirection == ""
            || $scope.formSearch.gearNum1==""|| $scope.formSearch.gearNum2 == ""){
            err.push("查询条件有误，请检查");
        }
        if(err.length > 0){
            $alert.error(err.join('! '));
            return
        }
        
        searchCondition.trainId = $scope.formSearch.trainId;
        searchCondition.trainDirection = $scope.formSearch.trainDirection === "上行" ? 0 : 1;
        searchCondition.motorNum = parseInt( $scope.formSearch.motorNum);

        $scope.formSearch.setLoading(true);
        $scope.formSearch.setLoaded(false);
        tempTrendService.retrieveTrendencyRecordForChart(searchCondition).then(
            function(data){
                if(typeof(data) == "string"){
                    $alert.error(data);
                    $scope.formSearch.setLoading(false);
                    return
                }
                $scope.formSearch.setLoaded(true);
                $scope.formSearch.setLoading(false);
                var title = {
                    text: '第一张图'
                };

                $scope.trainDateForX = data.trainDateForX;
                $scope.temp = data.temp;

                $scope.$broadcast('GearChartDataUpdated');
            },
            function(err){
                $scope.formSearch.setLoading(false);
            }
        )
    };
    $scope.gearTrendencyRecords = [];


    $scope.$on('GearChartDataUpdated', function(event){
        $timeout(function(){
            $rootScope.$broadcast('ResizePage');
        }, 100);
    });

    $scope.$on('GearChartDataUpdated', function(event){
        var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;

        var firstChart = null;
        firstChart = new Highcharts.Chart({
            chart: {
                renderTo: 'firstChart',
                type: 'spline',
                zoomType: 'x',
                marginRight: 100,
            },
            title: {
                text: $scope.formSearch.motorNum + '号电机' + '温度趋势分析图'
            },
            xAxis: {
                categories: $scope.trainDateForX,
                tickInterval: $scope.tickInterval
            },
            yAxis: {
                title: {
                    text: '电机温度'
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
            },
 
            series: [
                {
                    name: '温度',
                    data: $scope.temp
                }
            ],
            credits: {
                enabled: false // 禁用版权信息
            }
        });
    });


    angular.element(document).ready(function() {
        $rootScope.$broadcast("HideDashboard");
        $rootScope.$broadcast('ResizePage');

    });
}]);
