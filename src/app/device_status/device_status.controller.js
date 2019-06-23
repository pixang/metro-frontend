'use strict';

var module = angular.module('supportAdminApp');

module.controller("DeviceStatus", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert','DeviceStatusService',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, deviceStatusService){

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
            llaserState: '',
            plcState: '',
            rlaserState: '',
            temState: ''
        };
        $scope.formForThresholdOfDown = {
            llaserState: '',
            plcState: '',
            rlaserState: '',
            temState: ''
        };

        $scope.searchThresholdData = function(){
                
            $scope.formSearch.setLoading(true);
            $scope.formSearch.setLoaded(false);

            deviceStatusService.retrieveThresholdData().then(
                function(data){
                    if(typeof(data) == "string"){
                        $alert.error(data);

                        $scope.formSearch.setLoading(false);
                        return
                    }

                    $scope.formForThresholdOfUp = data['up'];
                    $scope.formForThresholdOfDown = data['down'];

                    $scope.formForThresholdOfUp.llaserState = $scope.formForThresholdOfUp.llaserState === 0 ?'正常': '异常';
                    $scope.formForThresholdOfUp.plcState = $scope.formForThresholdOfUp.plcState === 0 ?'正常': '异常';
                    $scope.formForThresholdOfUp.rlaserState = $scope.formForThresholdOfUp.rlaserState === 0 ?'正常': '异常';
                    $scope.formForThresholdOfUp.temState = $scope.formForThresholdOfUp.temState === 0 ?'正常': '异常';

                    $scope.formForThresholdOfDown.llaserState = $scope.formForThresholdOfDown.llaserState === 0 ?'正常': '异常';
                    $scope.formForThresholdOfDown.plcState = $scope.formForThresholdOfDown.plcState === 0 ?'正常': '异常';
                    $scope.formForThresholdOfDown.rlaserState = $scope.formForThresholdOfDown.rlaserState === 0 ?'正常': '异常';
                    $scope.formForThresholdOfDown.temState = $scope.formForThresholdOfDown.temState === 0 ?'正常': '异常';
                    $scope.formSearch.setLoaded(true);
                    $scope.formSearch.setLoading(false);
                },
                function(err){
                    $scope.formSearch.setLoading(false);
                }
            )
        };

        $scope.searchThresholdData();

        $scope.backFromConfigurationPage = function() {
            $rootScope.$broadcast("ShowDashboard");
            $state.go('index.main');
        };

        angular.element(document).ready(function() {
            $rootScope.$broadcast("HideDashboard");
        });
}]);
