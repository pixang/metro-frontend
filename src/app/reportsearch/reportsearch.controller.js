'use strict';

var module = angular.module('supportAdminApp');

module.controller("ReportSearchController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','ReportSearchService', 'DetailMotorDataService','constants',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, reportSearchService,detailMotorDataService, $const){
        $scope.showReportSearch = true;

        $scope.hideDetailMotorData = true;
        $scope.showMotorWave = false;
        $scope.showMotorTable = false;

        $scope.$on('ReportDataUpdated', function(event){
            $('.footable-report-search').footable({ paginate:false });
            $timeout(function(){
                $('.footable-report-search').trigger('footable_redraw');
            },100)
        });
        $scope.$on("ShowReportSearch",
            function (event,msg) {
            $scope.showReportSearch = true;
            $scope.hideDetailMotorData = true;
        });
        $scope.$on("HideReportSearch",
            function (event,msg) {
            $scope.showReportSearch = false;
            $scope.hideDetailMotorData = false;
        });
        $scope.$on("ShowDetailMotorData",
            function (event,msg) {
            $scope.showReportSearch = false;
            $scope.hideDetailMotorData = false;
            $scope.showMotorWave = false;
            $scope.showMotorTable = false;
        });
        $scope.$on('DetailMotorDataUpdated', function(event){
            $('.footable-for-motor').footable({ paginate:false });
            $timeout(function(){
                $('.footable-for-motor').trigger('footable_redraw');
            }, 100);
        });
        $scope.$on('DetailMotorGearRecordsUpdated', function(event){
            $timeout(function() {
                var realcontentHeigh = $(".real-content-table").height() + $(".second-header").height() + 210;
                $('body').css("height", realcontentHeigh + "px");
                $('#page-wrapper').css("height", realcontentHeigh + "px");
                $('#sidebar-wrapper').css("height", realcontentHeigh + "px");
            },300);
        });
        $scope.$on('DetailMotorLaserRecordsUpdated', function(event){
            // $timeout(function() {
            //     var realcontentHeigh = $(".real-content-wave").height() + $(".second-header").height() + 210;
            //     $('body').css("height", realcontentHeigh + "px");
            //     $('#page-wrapper').css("height", realcontentHeigh + "px");
            //     $('#sidebar-wrapper').css("height", realcontentHeigh + "px");
            // },300);
        });
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds =$const.TRAIN_ID.slice(0);
        $scope.trainIds.unshift("全部");

        //radio box
        $scope.selectedItem  = null;
        $scope.inputTrainId  = "全部";
        $scope.querySearch = function(query) {
            if(query === "全部"){
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
        $scope.$on('DetailMotorLaserRecordsUpdated', function(event){
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
                    plotLines: [{
                        color: 'red',
                        dashStyle: 'solid',
                        value: $scope.detailMotorLaserRecords.gapWarn,
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

                    plotLines: [{
                        color: 'red',
                        dashStyle: 'solid',
                        value: $scope.detailMotorLaserRecords.gapWarn,
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
        $scope.backFromDetailMotorPage = function() {
            $rootScope.$broadcast("ShowReportSearch","wusuowei");
        };
        $scope.backFromMotorWave = function() {
            $rootScope.$broadcast("ShowDetailMotorData","wusuowei");
        };
        $scope.backFromMotorTable = function() {
            $rootScope.$broadcast("ShowDetailMotorData","wusuowei");
        };

        // checkbox
        $scope.items = ['异常预警','异常报警','气隙预警','气隙报警','槽深预警','槽深报警'];
        $scope.items_1 = ['槽楔预警','槽楔报警','温度预警','温度报警','状态正常','排障器高度预警','排障器高度报警'];

        $scope.itemsTransfer = [6,1,7,2,8,3];
        $scope.itemsTransfer_1 = [9,4,10,5,11,12,13];

        $scope.selected = [];
        $scope.toggle = function (item) {
            var idx = $scope.selected.indexOf($scope.itemsTransfer[$scope.items.indexOf(item)]);
            if (idx > -1) {
                $scope.selected.splice(idx, 1);
            }
            else {
                $scope.selected.push($scope.itemsTransfer[$scope.items.indexOf(item)]);
            }
        };
        $scope.toggle_1 = function (item) {
            var idx = $scope.selected.indexOf($scope.itemsTransfer_1[$scope.items_1.indexOf(item)]);
            if (idx > -1) {
                $scope.selected.splice(idx, 1);
            }
            else {
                $scope.selected.push($scope.itemsTransfer_1[$scope.items_1.indexOf(item)]);
            }
        };
        $scope.exists = function (item) {
            return $scope.selected.indexOf($scope.itemsTransfer[$scope.items.indexOf(item)]) > -1;
        };
        $scope.exists_1 = function (item) {
            return $scope.selected.indexOf($scope.itemsTransfer_1[$scope.items_1.indexOf(item)]) > -1;
        };

        // fixed data 
        $scope.line = $const.LINE;
        $scope.station = $const.STATION;
        $scope.trainIds =$const.TRAIN_ID.slice(0);
        $scope.trainIds.unshift("全部");
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

        $scope.formSearch = {
            startTime: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            endTime: new Date(),
            trainId: "全部",
            trainDirection: "上行",
            selected:$scope.selected,

            motorNum: '',

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
            if (!$scope.formSearch.trainId || !$scope.formSearch.trainDirection ){
                err.push("查询条件有误，请检查");
            }
            
            if(err.length > 0){
                $alert.error(err.join('! '))
                return
            }
            if(searchCondition.startTime > searchCondition.endTime){
                $alert.error("起始时间不能大于结束时间");
                return
            }
            
            searchCondition.trainId = $scope.formSearch.trainId ==="全部" ? 'all':$scope.formSearch.trainId;
            if($scope.formSearch.trainDirection === "上行"){
                searchCondition.trainDirection = 0;
            }else if($scope.formSearch.trainDirection === "下行"){
                searchCondition.trainDirection = 1;
            }else{
                searchCondition.trainDirection = 2;
            }
            searchCondition.trainStateList = $scope.selected.length === 0 ? [6,1,7,2,8,3,9,4,10,5,11] : $scope.selected;

            searchCondition.trainStation = $scope.station;

            if($scope.pagination.currentPageReset === false){
                searchCondition.page = parseInt($scope.pagination.current);
                $scope.pagination.currentPageReset = true;
            }else{
                searchCondition.page = 1;
            }
            searchCondition.pageSize = parseInt($scope.pagination.pageSize);

            $scope.formSearch.setLoaded(false);
            $scope.formSearch.setLoading(true);
            reportSearchService.retrieveRecord(searchCondition).then(
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

        $scope.trianOnlyIdForMotor = '';
        $scope.trainDirectionForMotor = '';
        $scope.trianDateForMotor = '';
        $scope.getMotorData = function(index) {
            $scope.trianOnlyIdForMotor = $scope.reportRecords[index].trainOnlyid;
            $scope.trainDirectionForMotor = $scope.reportRecords[index].trainDirection == "上行" ? 0 : 1 ;
            $scope.trianDateForMotor = $scope.reportRecords[index].trainDate;
           
            $scope.searchMotorData( $scope.trianOnlyIdForMotor, $scope.trainDirectionForMotor)
    
            $rootScope.$broadcast("HideReportSearch","wusuowei");
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

        $scope.exportData = function(){
            var csvString = "线路,站点,车号,安装点,主控端,左齿最小,右齿最小,左槽楔最大,右槽楔最大,左槽深最小,右槽深最小,左槽隙最大深度,右槽隙最大深度,状态,时间" + "\n";

            var raw_table = $scope.reportRecords;
            for ( var idx=0, len = raw_table.length; idx<len; idx++) {
                csvString  = csvString + "4," + "飞沙角," + "\'" + $scope.reportRecords[idx].trainId + "\'" + "," + $scope.reportRecords[idx].trainDirection + ","
                    + $scope.reportRecords[idx].controlNum + "," +  $scope.reportRecords[idx].lgapMin   + ","
                    + $scope.reportRecords[idx].rgapMin  + "," + raw_table[idx].lslothMax + "," + raw_table[idx].rslothMax + ","
                    + $scope.reportRecords[idx].lslotMin + "," + $scope.reportRecords[idx].rslotMin + ","
                    + raw_table[idx].lslotMax + "," + raw_table[idx].rslotMax + ","

                    + $scope.reportRecords[idx].trainState + ","  +$scope.reportRecords[idx].trainDate +  "," ;

                csvString = csvString.substring(0,csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var file_name = $scope.formSearch.trainId + "_查询报表.csv";

            var a = $('<a/>', {
                style:'display:none',
                href:'data:application/octet-stream;base64,'+ btoa(unescape(encodeURIComponent(csvString))),
                download: file_name
            }).appendTo('body');
            a[0].click();
            a.remove();
        };

        $scope.exportMotorData = function(){
            var csvString = "线路,车号,主控端,站点,安装点,状态,行车时间,电机号,左齿最低高度,右齿最低高度,左槽隙最低深度,右槽隙最低深度,左槽楔最大,右槽楔最大,左排障器高度,右排障器高度," +
                "左槽隙最大深度,右槽隙最大深度,最大温度,速度,四角差值" + "\n";

            var raw_table = $scope.detailMotorRecords.result;
            for ( var idx=0, len = raw_table.length; idx<len; idx++) {
                csvString  = csvString + "4," + "\'" + $scope.detailMotorRecords.trainId + "\'" + "," + $scope.detailMotorRecords.controlNum + "," + "飞沙角,"
                    + $scope.detailMotorRecords.trainDirection + "," +  $scope.detailMotorRecords.trainState   + ","
                    + $scope.trianDateForMotor + "," + (idx+1) + ","
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
                csvString  = csvString + "4," + "\'" + $scope.detailMotorRecords.trainId + "\'" + "," + $scope.detailMotorRecords.controlNum + "," + "飞沙角,"
                                              + $scope.detailMotorRecords.trainDirection + "," +  $scope.detailMotorRecords.trainState   + ","
                                              + $scope.trianDateForMotor + ","
                                              + raw_table[idx].gearNum + "," + raw_table[idx].lgapValue + "," + raw_table[idx].rgapValue + "," + raw_table[idx].lslotDepth + ","
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
            $('.footable').footable({ paginate:false });
        });
}]);
