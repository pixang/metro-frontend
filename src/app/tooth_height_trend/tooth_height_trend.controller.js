'use strict';

var module = angular.module('supportAdminApp');

module.controller("ToothHeightTrendController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','ToothHeightTrendService','constants',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, toothHeightTrendService, $const){

    // footable
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
    $scope.gears = $const.GEAR;
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
        gearNum1: "7",
        gearNum2: "73",
   
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
        searchCondition.gearNum1 = parseInt(  $scope.formSearch.gearNum1 );
        searchCondition.gearNum2 = parseInt( $scope.formSearch.gearNum2);

        if($scope.pagination.currentPageReset === false){
            searchCondition.page = parseInt($scope.pagination.current);
            $scope.pagination.currentPageReset = true;
        }else{
            searchCondition.page = 1;
        }
        searchCondition.pageSize = parseInt($scope.pagination.pageSize);

        $scope.formSearch.setLoading(true);
        $scope.formSearch.setLoaded(false);
        toothHeightTrendService.retrieveTrendencyRecord(searchCondition).then(
            function(data){
                if(typeof(data) == "string"){
                    $alert.error(data);

                    $scope.formSearch.setLoading(false);
                    return
                }
                $scope.gearTrendencyRecords = data.result;

                $scope.formSearch.setLoaded(true);
                $scope.formSearch.setLoading(false);

                $scope.pagination.current = data.pageNum;
                $scope.pagination.totalPages = data.pages;

                $scope.pages = generatePagesArray($scope.pagination.current,  $scope.pagination.totalPages, 9)
                $scope.$broadcast('GearTableDataUpdated');
            },
            function(err){
                $scope.formSearch.setLoading(false);
            }
        )
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
        if ($scope.formSearch.trainId === "" || $scope.formSearch.motorNum ==="" || $scope.formSearch.trainDirection === ""
            || $scope.formSearch.gearNum1=== ""|| $scope.formSearch.gearNum2 === ""){
            err.push("查询条件有误，请检查");
        }
        if(err.length > 0){
            $alert.error(err.join('! '))
            return
        }
        
        searchCondition.trainId = $scope.formSearch.trainId;
        searchCondition.trainDirection = $scope.formSearch.trainDirection === "上行" ? 0 : 1;
        searchCondition.motorNum = parseInt( $scope.formSearch.motorNum);
        searchCondition.gearNum1 = parseInt(  $scope.formSearch.gearNum1 );
        searchCondition.gearNum2 = parseInt( $scope.formSearch.gearNum2);

        $scope.formSearch.setLoading(true);
        $scope.formSearch.setLoaded(false);
        toothHeightTrendService.retrieveTrendencyRecordForChart(searchCondition).then(
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
                $scope.leftGearForY_0 = data.leftGearForY_0;
                $scope.rightGearForY_0 = data.rightGearForY_0;

                $scope.leftGearForY_1 = data.leftGearForY_1;
                $scope.rightGearForY_1 = data.rightGearForY_1;
                             
                $scope.$broadcast('GearChartDataUpdated');
            },
            function(err){
                $scope.formSearch.setLoading(false);
            }
        )
    };

    $scope.gearTrendencyRecords = [];

    $scope.exportGearData = function(){
        var csvString = "时间,线路,车号,安装点,电机号,齿号,左数值,右数值" + "\n";
        
        var raw_table = $scope.gearTrendencyRecords;
        for ( var idx=0, len = raw_table.length; idx<len; idx++) {
            
            csvString  = csvString + raw_table[idx].trainDate+"," + "4," + "\'" + raw_table[idx].trainId + "\'"+ "," + raw_table[idx].trainDirection +
                            "," + raw_table[idx].motorNum + "," +  raw_table[idx].gearNum + "," + raw_table[idx].leftGear + "," + raw_table[idx].rightGear  + ",";
            
            csvString = csvString.substring(0,csvString.length - 1);
            csvString = csvString + "\n";
   
        }
        csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);
        var a = $('<a/>', {
            style:'display:none',
            href:'data:application/octet-stream;base64,'+ btoa(unescape(encodeURIComponent(csvString))),
            download: $scope.formSearch.trainId + '_齿高趋势查询表.csv'
        }).appendTo('body');
        a[0].click();
        a.remove();
    };


    $scope.$on('GearChartDataUpdated', function(event){
        $timeout(function(){
            $rootScope.$broadcast('ResizePage');
        }, 100);
    });


    $scope.$on('GearChartDataUpdated', function(event){
        var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;

        var firstChart = new Highcharts.Chart({
            chart: {
                renderTo: 'firstChart',
                type: 'spline',
                zoomType: 'x',
                marginRight: 100,
            },
            title: {
                text: $scope.formSearch.motorNum + '号电机第' +$scope.formSearch.gearNum1 + '齿气隙高度趋势分析图'
            },
            xAxis: {
                categories: $scope.trainDateForX,
                tickInterval: $scope.tickInterval
            },
            yAxis: {
                title: {
                    text: '电机气隙高度'
                },
                min:19,
                max:28,
                tickInterval:1,

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
                    name: '左传感器数值',
                    data: $scope.leftGearForY_0
                },
                {
                    name: '右传感器数值',
                    data: $scope.rightGearForY_0
                }
            ],
            credits:{
                enabled: false // 禁用版权信息
           }
            
        });
    });


    $scope.$on('GearChartDataUpdated', function(event){
        var dafaultMenuItem = Highcharts.getOptions().exporting.buttons.contextButton.menuItems;
        var secondChart = null;
        secondChart =  new Highcharts.Chart({
            chart: {
                renderTo: 'secondChart',
                type: 'spline',
                zoomType: 'x',
                marginRight: 100,
            },
            title: {
                text: $scope.formSearch.motorNum + '号电机第' +$scope.formSearch.gearNum2 + '齿气隙高度趋势分析图'
            },
            xAxis: {
                categories: $scope.trainDateForX,
                tickInterval: $scope.tickInterval
            },
            yAxis: {
                title: {
                    text: '电机气隙高度'
                },
                min:19,
                max:28,
                tickInterval:1,
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
                    name: '左传感器数值',
                    data: $scope.leftGearForY_1
                },
                {
                    name: '右传感器数值',
                    data: $scope.rightGearForY_1
                },
            ],
            credits:{
                enabled: false 
            }
            
        });
    });

    $scope.pagination = {
        current: 1,
        totalPages: 1,
        currentPageReset: true,
        pageSize:  $scope.pageSizes[1].value
    };
    $scope.setCurrent = function(num) {
        if(num ==='...' || num == $scope.pagination.current || num == 0 || num == ($scope.pagination.totalPages+1)){
            return
        }
        $scope.pagination.current = num;
        $scope.pagination.currentPageReset = false;
        $scope.search();
    };
  
    $scope.onChange = function() {
        $scope.search();
    };
  
    // calculate the array of the page
    function generatePagesArray(currentPage, totalPages, paginationRange) {
        var pages = [];
        var halfWay = Math.ceil(paginationRange / 2);
        var position;

        if (currentPage <= halfWay) {
            position = 'start';
        } else if (totalPages - halfWay < currentPage) {
            position = 'end';
        } else {
            position = 'middle';
        }

        var ellipsesNeeded = paginationRange < totalPages;
        var i = 1;
        while (i <= totalPages && i <= paginationRange) {
            var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

            var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
            var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
            if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                pages.push('...');
            } else {
                pages.push(pageNumber);
            }
            i ++;
        }
        return pages;
    }

    function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
        var halfWay = Math.ceil(paginationRange/2);
        if (i === paginationRange) {
            return totalPages;
        } else if (i === 1) {
            return i;
        } else if (paginationRange < totalPages) {
            if (totalPages - halfWay < currentPage) {
                return totalPages - paginationRange + i;
            } else if (halfWay < currentPage) {
                return currentPage - halfWay + i;
            } else {
                return i;
            }
        } else {
            return i;
        }
    }
    angular.element(document).ready(function() {
        $rootScope.$broadcast("HideDashboard");
        $rootScope.$broadcast('ResizePage');
    });
}]);
