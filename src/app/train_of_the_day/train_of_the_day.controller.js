'use strict';

var module = angular.module('supportAdminApp');

module.controller("TrainOfTheDayController", ['$scope', '$state','$rootScope','$timeout','$mdpDatePicker', '$mdpTimePicker','Alert', 'constants','MainService',
    function($scope, $state, $rootScope,$timeout, $mdpDatePicker, $mdpTimePicker, $alert, $const, mainService){

        $scope.$on('CurrentDayRecordUpdate', function (event) {
            $timeout(function () {
                $('.footable-for-the-day').footable({paginate: false});
                $('.footable-for-the-day').trigger('footable_redraw');
                }, 100);
            $timeout(function(){
                $rootScope.$broadcast('ResizePage');
            }, 800);
        });

        $scope.form = {
            isLoaded: false,
            isLoading: false,
            setLoaded: function (loaded) {
                this.isLoaded = loaded;
            },
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };
        $scope.backToMainPage = function(){
            $rootScope.$broadcast("ShowDashboard","wusuowei");
            $state.go('index.main');
        };

        $scope.goToMotorPage = function (index) {
            var trianOnlyIdForMotor = $scope.currentDayRecords[index].trainOnlyid;
            var trainDirectionForMotor = $scope.currentDayRecords[index].trainDirection;
            var trianDateForMotor = $scope.currentDayRecords[index].trainDate;
            $state.go('index.detailmotordata', {
                trainOnlyId: trianOnlyIdForMotor,
                trainDirection: trainDirectionForMotor,
                trainDate: trianDateForMotor,
                previousUrl: 'index.trainoftheday'
            });
            // var modalInstance = $modal.open({
            //     size: 'md',
            //     templateUrl: 'app/main/main-dialog.html',
            //     controller: 'MainDialogController',
            //     resolve: {
            //         trainOnlyId: function () {
            //             return index;
            //         }
            //     }
            // });
        };
        $scope.getCurrentDayData = function () {
            $alert.clear();
            $scope.form.setLoading(true);
            mainService.retrieveCurrentDayData().then(
                function (data) {
                    if (typeof(data) == "string") {
                        $alert.error(data, $scope);
                        $scope.form.setLoading(false);
                        return
                    }
                    if (data.result.length == 0) {
                        $alert.error("无数据", $scope);
                        $scope.form.setLoading(false);
                        return
                    }
                    $scope.currentDayRecords = data.result;

                    $scope.form.setLoading(false);
                    $scope.form.setLoaded(true);

                    $scope.$broadcast('CurrentDayRecordUpdate');
                },
                function (err) {
                    $scope.exception = true;
                    $scope.form.setLoading(false);
                }
            )
        };
        $scope.currentDayRecords = [];


        $scope.exportToCsv = function () {
            var csvString = "车号,行车日期,主控端,电机号,气隙最小值,第3齿左气隙最小值,第3齿右气隙最小值,第73齿左气隙最小值,第73齿右气隙最小值,温度最小值,温度最大值" + "\n";

            var raw_table = $scope.currentDayRecords;
            for (var idx = 0, len = raw_table.length; idx < len; idx++) {

                csvString = csvString + '\'' +raw_table[idx].trainId + '\'' + "," + raw_table[idx].trainDate + "," + raw_table[idx].controlNum + "," + raw_table[idx].motorNum +
                    "," + raw_table[idx].gapminVal + "," + raw_table[idx].tlgapMin + "," + raw_table[idx].trgapMin + "," + raw_table[idx].slgapMin + "," +
                    raw_table[idx].srgapMin + "," + raw_table[idx].tempMin + "," + raw_table[idx].tempMax;

                csvString = csvString.substring(0, csvString.length - 1);
                csvString = csvString + "\n";
            }
            csvString = "\uFEFF" + csvString.substring(0, csvString.length - 1);
            var date = raw_table[0].trainDate.substring(0,10);

            var a = $('<a/>', {
                style: 'display:none',
                href: 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(csvString))),
                download: date + '_过车记录表.csv'
            }).appendTo('body');
            a[0].click();
            a.remove();
        };


        angular.element(document).ready(function() {
            $('.footable-for-the-day').footable({paginate: false});
            $rootScope.$broadcast("HideDashboard","wusuowei");
            $scope.getCurrentDayData();
            $rootScope.$broadcast('ResizePage');
        });
    }]);
