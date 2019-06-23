'use strict';

var module = angular.module('supportAdminApp');

module.controller("SystemConfiguration", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','SystemConfigurationService',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, systemConfigurationService){

        $scope.formSearch = {
            isLoaded : false,
            isLoading : false,
            setLoaded: function(loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function(loading) {
                this.isLoading = loading;
            }
        };

        $scope.formForThresholdOfUp = {   
            gapAlarm: '',
            gapWarn: '',
            slotAlarm: '',
            slotWarn: '',
            slotdAlarm: '',
            slotdWarn: '',
            tempAlarm: '',
            tempWarn: '',
            expAlarm: '',
            expWarn: '',
            pilotAlarm: '',
            pilotWarm: '',
            udFlag: 0
        };
        $scope.formForThresholdOfDown = {   
            gapAlarm: '',
            gapWarn: '',
            slotAlarm: '',
            slotWarn: '',
            slotdAlarm: '',
            slotdWarn: '',
            tempAlarm: '',
            tempWarn: '',
            expAlarm:'',
            expWarn:'',
            pilotAlarm: '',
            pilotWarm: '',
            udFlag: 1
        };
        $scope.formForFlagOfUp = {
            lsensor1: '',
            lsensor2: '',
            lsensor3: '',
            rsensor1: '',
            rsensor2: '',
            rsensor3: '',
            lrailplane: '',
            rrailplane: '',
            lamend: '',
            ramend: '',
            udFlag: 0
        };
        $scope.formForFlagOfDown = {
            lsensor1: '',
            lsensor2: '',
            lsensor3: '',
            rsensor1: '',
            rsensor2: '',
            rsensor3: '',
            lrailplane: '',
            rrailplane: '',
            lamend: '',
            ramend: '',
            udFlag: 1
        };
        $scope.searchFlagData = function(){
                
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);
            systemConfigurationService.retrieveFlagData().then(
                function(data){
                    if(typeof(data) == "string"){
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    if(data[0].udFlag == 0){
                        $scope.formForFlagOfUp = data[0];
                        $scope.formForFlagOfDown = data[1];
                    }
                    else{
                        $scope.formForFlagOfUp = data[1];
                        $scope.formForFlagOfDown = data[0];
                    }

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };

        $scope.saveFlagData = function(){
            $alert.clear();
            var err = [];
            var searchCondition = [];
         
            for(var prop in $scope.formForFlagOfUp){
                if(prop == "udFlag"){
                    continue
                }
                if($scope.formForFlagOfUp[prop]){
                    if( isNaN($scope.formForFlagOfUp[prop]) ){
                        $alert.error("数据不合法，请检查");
                        return
                    }else{
                        $scope.formForFlagOfUp[prop] = fix_number($scope.formForFlagOfUp[prop])
                    }
                }
                else{
                    $alert.error("数据不能为空，请检查")
                    return
                }
            }
            for(var prop in $scope.formForFlagOfDown){
                if($scope.formForFlagOfDown[prop]){
                    if( isNaN($scope.formForFlagOfDown[prop]) ){
                        $alert.error("数据不合法，请检查")
                        return 
                    }else{
                        if(prop == 'udFlag'){
                            $scope.formForFlagOfDown[prop] = parseInt($scope.formForFlagOfDown[prop])
                        }else{
                            $scope.formForFlagOfDown[prop] = fix_number($scope.formForFlagOfDown[prop])
                        }
                    }
                }
                else{
                    $alert.error("数据不能为空，请检查")
                    return
                }
            }
            
            searchCondition.push($scope.formForFlagOfUp);
            searchCondition.push($scope.formForFlagOfDown);
   
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);
            systemConfigurationService.saveFlagData(searchCondition).then(
                function(data){
                    if(data == "更新成功"){
                        $alert.info("保存成功");
                    }

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function(err){
                    $alert.error("服务器出错，未能保存成功");
                }
            )
        };
        $scope.saveThresholdData = function(){
            $alert.clear();
            var err = [];
            var searchCondition = [];
         
            for(var prop in $scope.formForThresholdOfUp){
                if( prop == 'udFlag'){
                    continue
                }
                if($scope.formForThresholdOfUp[prop]){
                    if( isNaN($scope.formForThresholdOfUp[prop]) ){
                        $alert.error("数据不合法，请检查");
                        return 
                    }else{
                        $scope.formForThresholdOfUp[prop] = fix_number($scope.formForThresholdOfUp[prop])
                    }
                }
                else{
                    $alert.error("数据不能为空，请检查");
                    return
                }
            }
            for(var prop in $scope.formForThresholdOfDown){

                if($scope.formForThresholdOfDown[prop]){
                    if( isNaN($scope.formForThresholdOfDown[prop]) ){
                        $alert.error("数据不合法，请检查");
                        return 
                    }else{
                        if(prop == 'udFlag'){
                            $scope.formForThresholdOfDown[prop] = parseInt($scope.formForThresholdOfDown[prop])
                        }else{
                            $scope.formForThresholdOfDown[prop] = fix_number($scope.formForThresholdOfDown[prop])
                        }
                    }
                }
                else{
                    $alert.error("数据不能为空，请检查")
                    return
                }
            }
            
            searchCondition.push($scope.formForThresholdOfUp);
            searchCondition.push($scope.formForThresholdOfDown);
   
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);
            systemConfigurationService.saveThresholdData(searchCondition).then(
                function(data){
                    if(data == "更新成功"){
                        $alert.info("保存成功");
                    }

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };

        function fix_number(x) {
            return Number.parseFloat(x).toFixed(2);
        }

        $scope.searchThresholdData = function(){
                
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            systemConfigurationService.retrieveThresholdData().then(
                function(data){
                    if(typeof(data) == "string"){
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }
                    if(data[0].udFlag == 0){
                        $scope.formForThresholdOfUp = data[0];
                        $scope.formForThresholdOfDown = data[1];
                    }
                    else{
                        $scope.formForThresholdOfUp = data[1];
                        $scope.formForThresholdOfDown = data[0];
                    }

                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };

        $scope.searchFlagData();
        $scope.searchThresholdData();

        $scope.backFromConfigurationPage = function() {
            $rootScope.$broadcast("ShowDashboard");
            $state.go('index.main');
        };

        angular.element(document).ready(function() {
            $rootScope.$broadcast("HideDashboard");
        });
}]);
