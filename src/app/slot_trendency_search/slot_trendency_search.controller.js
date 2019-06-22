'use strict';

var module = angular.module('supportAdminApp');

module.controller("SlotTrendencySearchController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','SlotTrendencyService','constants',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, slotTrendencyService,$const){

    // footable
    angular.element(document).ready(function () {
        $('.footable').footable({ paginate:false });
    });
      
    $scope.$on('SlotTableDataUpdated', function(event){
        $timeout(function(){
            $('.footable').trigger('footable_redraw');
            $rootScope.$broadcast('ResizePage');
        }, 900);
        $timeout(function(){
            $('.footable').trigger('footable_redraw');
        }, 100);
    });


    $scope.selectedItem  = null;
    $scope.inputTrainId  = "001002";
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
    $scope.line = $const.LINE;
    $scope.station = $const.STATION;
    $scope.slots = $const.SLOT;
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
        if (!($scope.formSearch.trainId && $scope.formSearch.motorNum && $scope.formSearch.trainDirection
          && $scope.formSearch.firstSlot && $scope.formSearch.secondSlot)){
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
        if($scope.formSearch.firstSlot === $scope.formSearch.secondSlot){
            $alert.error("请勿输入相同的槽隙编号");
            return 
        }
        
        searchCondition.trainId = $scope.formSearch.trainId;
        searchCondition.trainDirection = $scope.formSearch.trainDirection === "上行" ? 0 : 1;
        searchCondition.motorNum = parseInt( $scope.formSearch.motorNum);
        searchCondition.firstSlot = parseInt(  $scope.formSearch.firstSlot );
        searchCondition.secondSlot = parseInt( $scope.formSearch.secondSlot);

        if($scope.pagination.currentPageReset === false){
            searchCondition.page = parseInt($scope.pagination.current);
            $scope.pagination.currentPageReset = true;
        }else{
            searchCondition.page = 1;
        }

        searchCondition.pageSize = parseInt($scope.pagination.pageSize);
        
        $scope.formSearch.setLoaded(false);
        $scope.formSearch.setLoading(true);
        slotTrendencyService.retrieveTrendencyRecord(searchCondition).then(
            function(data){
                if(typeof(data) == "string"){
                    $alert.error(data);

                    $scope.formSearch.setLoading(false);
                    return
                }
                $scope.slotTrendencyRecords = data.result;

                $scope.formSearch.setLoaded(true);
                $scope.formSearch.setLoading(false);

                $scope.pagination.current = data.pageNum;
                $scope.pagination.totalPages = data.pages;
                $scope.pages = generatePagesArray($scope.pagination.current,  $scope.pagination.totalPages, 9)
                $scope.$broadcast('SlotTableDataUpdated');
            },
            function(err){
                $scope.formSearch.setLoading(false);
            }
        )
    };

    $scope.slotTrendencyRecords = [];

    $scope.exportSlotData = function(){
        var csvString = "时间,线路,车号,安装点,电机号,槽隙编号,左槽高度,右槽高度,左槽深度,右槽深度" + "\n";
        
        var raw_table = $scope.slotTrendencyRecords;
        for ( var idx=0, len = raw_table.length; idx<len; idx++) {
            
            csvString  = csvString + raw_table[idx].trainDate+"," + "4," + "\'"+ raw_table[idx].trainId + "\'"+ "," + raw_table[idx].trainDirection +
                            "," + raw_table[idx].motorNum + "," +  raw_table[idx].gearNum + "," + raw_table[idx].lslotValue + "," + raw_table[idx].rslotValue  + "," + 
                            raw_table[idx].lslotDepth + "," + raw_table[idx].rslotDepth +  ",";
            
            csvString = csvString.substring(0,csvString.length - 1);
            csvString = csvString + "\n";
   
        }
        csvString =  "\uFEFF" + csvString.substring(0, csvString.length - 1);
        var a = $('<a/>', {
            style:'display:none',
            href:'data:application/octet-stream;base64,'+ btoa(unescape(encodeURIComponent(csvString))),
            download: $scope.formSearch.trainId + '_槽隙趋势查询表.csv'
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
        if(num === '...' || num === $scope.pagination.current || num == 0 || num == ($scope.pagination.totalPages+1)){
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
