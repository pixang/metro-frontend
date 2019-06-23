'use strict';

var module = angular.module('supportAdminApp');

module.controller("DrivingTableController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert', 'constants','DrivingTableService','DetailMotorDataService',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, $const, drivingTableService, detailMotorDataService){
        $scope.showReportSearch = true;

        $scope.hideDetailMotorData = true;
        $scope.showMotorWave = false;
        $scope.showMotorTable = false;
        
        $scope.$on('ReportDataUpdated', function(){
            $('.footable-driving-table').footable({ paginate:false });
            $timeout(function(){
                $('.footable-driving-table').trigger('footable_redraw');
            },100)
        });
        $scope.$on("ShowReportSearch", function () {
            $scope.showReportSearch = true;
            $scope.hideDetailMotorData = true;

            $scope.$broadcast('ReportDataUpdated');
        });

        $scope.$on("ShowDetailMotorData", function () {
            $scope.hideDetailMotorData = false;
            $scope.showMotorWave = false;
            $scope.showMotorTable = false;

            $scope.$broadcast('DetailMotorDataUpdated');
        });
        $scope.$on('DetailMotorDataUpdated', function(event){
            $('.footable-for-motor').footable({ paginate:false });
            $timeout(function(){
                $('.footable-for-motor').trigger('footable_redraw');
            },100)
        });
        $scope.$on('DetailMotorGearRecordsUpdated', function(event){
            $('.footable-for-gear').footable({ paginate:false });
            $timeout(function(){
                $('.footable-for-gear').trigger('footable_redraw');
            },100)
        });

        $scope.$on('DetailMotorLaserRecordsUpdated', function(){
            var firstChart = null;
            firstChart = new Highcharts.Chart({
                chart: {
                    renderTo: 'firstChart',
                    type: 'spline',
                    zoomType: 'x',
                    marginRight: 0
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
                        }
                    ]
        
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

        $scope.backFromDetailMotorPage = function() {
            $rootScope.$broadcast("ShowReportSearch");
        };
        $scope.backFromMotorWave = function() {
            $rootScope.$broadcast("ShowDetailMotorData");
        };
        $scope.backFromMotorTable = function() {
            $rootScope.$broadcast("ShowDetailMotorData");
        };

        $scope.pageSizes = [
            { name: '10', value: '10' },
            { name: '20', value: '20' },
            { name: '30', value: '30' },
            { name: '40', value: '40' },
            { name: '60', value: '60' },
            { name: '80', value: '80' },
            { name: '200', value: '200' }
        ];

        $scope.motorNums = [1,2,3,4,5,6,7,8];
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;

        $scope.formSearch = {
            motorNum: '',

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
                D = date.getDate()    < 10 ? '0'+(date.getDate()) : '' + (date.getDate());
            return Y + M + D + '000000';
        };

        $scope.search = function() {
            $alert.clear();
            var err = [];
            var searchCondition = {};
            // 取消注释
            var currentTime = new Date();
            searchCondition.pre = $scope.dateTransfer(currentTime);
            searchCondition.page = parseInt($scope.pagination.current);
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);

            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            drivingTableService.retrieveRecord(searchCondition).then(
                function(data){
                    if(typeof(data) == "string"){
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    $scope.reportRecords = data.result;

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);

                    $scope.pagination.current = data.pageNum;
                    $scope.pagination.totalPages = data.pages;

                    $scope.pages = generatePagesArray($scope.pagination.current,  $scope.pagination.totalPages, 9)
                    $scope.$broadcast('ReportDataUpdated');
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };
        $scope.reportRecords = [];

        $scope.searchMotorData = function(trainOnlyId, trainDirection) {
            $alert.clear();
            var err = [];

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
                $alert.error("此页面不可刷新，请返回并重新选择！");
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
                    if(typeof(data) == "string"){
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
        $scope.detailMotorLaserRecords = {};
        $scope.left = [];
        $scope.right = [];

         // 电机查询参数及时间显示
         $scope.trianOnlyIdForMotor = '';
         $scope.trainDirectionForMotor = '';
         $scope.trianDateForMotor = '';
         $scope.getMotorData = function(index) {
             $scope.trianOnlyIdForMotor = $scope.reportRecords[index].trainOnlyid;
             $scope.trainDirectionForMotor = $scope.reportRecords[index].trainDirection == "上行" ? 0 : 1 ;
             $scope.trianDateForMotor = $scope.reportRecords[index].trainDate;
            
             $scope.searchMotorData( $scope.trianOnlyIdForMotor, $scope.trainDirectionForMotor)

             $scope.showReportSearch = false;
             $scope.hideDetailMotorData = false;
         };
         $scope.getMotorWave = function(index) {
             $scope.formSearch.motorNum = index + 1;
             $scope.searchLaserDate( $scope.trianOnlyIdForMotor, $scope.trainDirectionForMotor , $scope.formSearch.motorNum);
 
             $scope.hideDetailMotorData = true;
             $scope.showMotorWave =true;
         };
         $scope.getMotorTable = function(index) {
             $scope.formSearch.motorNum = index + 1;
             
             $scope.searchGearDate($scope.trianOnlyIdForMotor, $scope.trainDirectionForMotor , $scope.formSearch.motorNum);
             
             $scope.hideDetailMotorData = true;
             $scope.showMotorTable =true;
         };
         $scope.onChangeInTable = function(){
             $scope.searchGearDate($scope.trianOnlyIdForMotor, $scope.trainDirectionForMotor , $scope.formSearch.motorNum);
         };
         $scope.onChangeInChart = function(){
             $scope.searchLaserDate($scope.trianOnlyIdForMotor, $scope.trainDirectionForMotor , $scope.formSearch.motorNum);
         };

        $scope.exportMotorData = function(){
            var csvString = "线路,车号,主控端,站点,安装点,状态,行车时间,电机号,左齿最低高度,右齿最低高度,左槽隙最低深度,右槽隙最低深度,左槽楔最大,右槽楔最大,左排障器高度,右排障器高度," +
                "左槽隙最大深度,右槽隙最大深度,最大温度,速度,四角差值" + "\n";

            var raw_table = $scope.detailMotorRecords.result;
            for ( var idx=0, len = raw_table.length; idx<len; idx++) {
                csvString  = csvString + "4," + "\'" + $scope.detailMotorRecords.trainId + "\'" + "," + $scope.detailMotorRecords.controlNum + "," + "飞沙角,"
                    + $scope.detailMotorRecords.trainDirection + "," +  $scope.detailMotorRecords.trainState   + ","
                    +  $scope.trianDateForMotor + "," + (idx+1) + ","
                    + raw_table[idx].lgapMin + "," + raw_table[idx].rgapMin + "," + raw_table[idx].lslotMin + "," + raw_table[idx].rslotMin + ","
                    + raw_table[idx].lslothMax + "," + raw_table[idx].rslothMax + "," + raw_table[idx].lpilotValue + "," + raw_table[idx].rpilotValue + ","
                    + raw_table[idx].lslotMax + "," + raw_table[idx].rslotMax + ","
                    + raw_table[idx].tempMax + "," + raw_table[idx].motorSpeed + "," + raw_table[idx].excValue;

                csvString = csvString.substring(0,csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);

            var file_name = $scope.detailMotorRecords.trainId + "_" + $scope.trianDateForMotor + "_电机报表.csv";
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
                
                    csvString  = csvString + "4," + "\'" + $scope.detailMotorRecords.trainId + "\'"+ "," + $scope.detailMotorRecords.controlNum + "," + "飞沙角,"
                                                  + $scope.detailMotorRecords.trainDirection + "," +  $scope.detailMotorRecords.trainState   + ","
                                                  + $scope.trianDateForMotor + "," + raw_table[idx].gearNum + "," + raw_table[idx].lgapValue + ","
                                                  + raw_table[idx].rgapValue + "," + raw_table[idx].lslotDepth + ","
                                                  + raw_table[idx].rslotDepth + "," + raw_table[idx].lslotValue + "," + raw_table[idx].rslotValue + ",";
                    
                    csvString = csvString.substring(0,csvString.length - 1);
                    csvString = csvString + "\n";
            }
            csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var download_name = $scope.detailMotorRecords.trainId + '_' + $scope.formSearch.motorNum + "号电机报表.csv";
            var a = $('<a/>', {
                style:'display:none',
                href:'data:application/octet-stream;base64,'+ btoa(unescape(encodeURIComponent(csvString))),
                download:download_name
            }).appendTo('body');
            a[0].click();
            a.remove();
        };


        $scope.pagination = {
            current: 1,
            totalPages: 1,
            pageSize:  $scope.pageSizes[1].value,
        };
        $scope.setCurrent = function(num) {
            if(num ==='...' || num == $scope.pagination.current || num == 0 || num == ($scope.pagination.totalPages+1)){
                return
            }
            $scope.pagination.current = num;
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
            $('.footable-driving-table').footable({ paginate:false });
            $rootScope.$broadcast("HideDashboard");
            $scope.search();
        });
    }]);
