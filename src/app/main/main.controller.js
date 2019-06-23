'use strict';

var module = angular.module('supportAdminApp');

module.controller('MainController', [
    '$log', '$scope', '$rootScope', '$timeout', '$interval', '$location', 'MainService', 'AuthService', '$state', '$uibModal', '$cookies', '$sce', 'Alert', 'constants',
    function ($log, $scope, $rootScope, $timeout, $interval, $location, mainService, $authService, $state, $modal, $cookies, $sce, $alert, $const) {
        // dashboard show control
        $scope.showDashboard = true;
        $scope.trainsInfo = [];
        $scope.currentUser = {};
        $scope.line = $const.LINE;

        $scope.lightStatus = [];

        /**
         * 初始化主页表格
         */
        function initTrainsInfo() {
            $scope.trainsInfo = [];
            var trainInfo = {};
            for (var idx = 0, len = $const.TRAIN_ID.length; idx < len; idx++) {
                trainInfo.trainId = $const.TRAIN_ID[idx];
                trainInfo.trainDetail = [];
                for (var i = 0; i < 23; i++) {
                    trainInfo.trainDetail.push({})
                }
                $scope.trainsInfo.push(trainInfo);
                trainInfo = {};
            }
        }
        initTrainsInfo();


        /**
         * 获取主页表格信息
         */
        $scope.getTrainInfo = function () {
            $alert.clear();

            if (sessionStorage.getItem("isRunning")) {
                mainService.retrieveTrainInfo().then(
                    function (record) {
                        if (typeof(record) === "string") {
                            var localTrainsInfo = JSON.parse(localStorage.getItem('trainsInfo')).trainsInfo;
                            $scope.trainsInfo = localTrainsInfo;
                            return
                        }

                        var index;
                        var objectForTrainsInfo = {};
                        var Record = function () {
                        };

                        if (!localStorage.getItem('trainsInfo')) {
                            index = $const.trainId.indexOf(record.trainId);

                            for (var idx = 0, len = record.trainInfoList.length; idx < len; idx++) {
                                $scope.trainsInfo[index].trainDetail[idx] = angular.extend(new Record(), trainInfo[len - idx - 1])
                            }
                        } else {
                            var localTrainsInfo = JSON.parse(localStorage.getItem('trainsInfo')).trainsInfo;

                            for(var ix = 0; ix < localTrainsInfo.length;ix++){
                                if(record.trainId === localTrainsInfo[ix].trainId){
                                    index = ix;
                                    break;
                                }
                            }
                            if (localTrainsInfo[index].trainDetail[record.trainInfoList.length - 1].trainOnlyid) {
                                $scope.trainsInfo = localTrainsInfo;
                                return
                            }
                            for (var idx = 0, len = record.trainInfoList.length; idx < len; idx++) {
                                localTrainsInfo[index].trainDetail[idx] = angular.extend(new Record(), record.trainInfoList[len - idx - 1])
                            }
                            $scope.trainsInfo = localTrainsInfo;
                        }
                        $scope.trainsInfo.sort(compare);
                        objectForTrainsInfo.trainsInfo = $scope.trainsInfo;
                        localStorage.setItem("trainsInfo", JSON.stringify(objectForTrainsInfo));

                        if ($cookies.get('currentUser')) {
                            var currentState = record.trainInfoList[0].trainState;
                            var trainOnlyId = record.trainInfoList[0].trainOnlyid;
                            var trainId = record.trainId;

                            $scope.warningLight(currentState,trainId,trainOnlyId);
                        }
                    },
                    function(err){
                        $alert.error('请求最新过车数据失败，将清空缓存，加载全局数据');
                        initTrainsInfo();
                        sessionStorage.removeItem('isRunning');
                        localStorage.removeItem("trainsInfo");
                        $timeout(function(){
                            $scope.getTrainInfo();
                        },200)
                    }
                )
            } else {
                mainService.retrieveAllTrainInfo().then(
                    function (record) {
                        if (typeof(record) === "string") {
                            return
                        }
                        initTrainsInfo();

                        var index;
                        var objectForTrainsInfo = {};
                        var Record = function () {
                        };

                        for (var prop in record) {
                            var trainInfo = record[prop];
                            index = $const.TRAIN_ID.indexOf(prop);

                            for (var idx = 0, len = trainInfo.length; idx < len; idx++) {
                                $scope.trainsInfo[index].trainDetail[idx] = angular.extend(new Record(), trainInfo[len - idx - 1])
                            }
                            if ($cookies.get('currentUser')) {
                                var currentState = trainInfo[0].trainState;
                                var trainOnlyId = trainInfo[0].trainOnlyid;
                                var trainId = prop;
                                $scope.warningLight(currentState,trainId,trainOnlyId);
                            }
                        }
                        $scope.trainsInfo.sort(compare);
                        objectForTrainsInfo.trainsInfo = $scope.trainsInfo;
                        localStorage.setItem("trainsInfo", JSON.stringify(objectForTrainsInfo));
                        sessionStorage.setItem('isRunning', "Y");
                    }
                )
            }
        };

        var compare = function (trainInfo_1,trainInfo_2) {
            if(trainInfo_1.trainDetail[0].trainDate && trainInfo_2.trainDetail[0].trainDate) {
                if (trainInfo_1.trainId < trainInfo_2.trainId) {
                    return -1;
                } else if (trainInfo_1.trainId > trainInfo_2.trainId) {
                    return 1
                } else {
                    return 0
                }
            }else if(trainInfo_1.trainDetail[0].trainDate){
                return -1;
            }else if(trainInfo_2.trainDetail[0].trainDate){
                return 1;
            }else{
                if (trainInfo_1.trainId < trainInfo_2.trainId) {
                    return -1;
                } else if (trainInfo_1.trainId > trainInfo_2.trainId) {
                    return 1
                } else {
                    return 0
                }
            }
        };

        // TRAIN_STATE:['异常报警','气隙报警','槽深报警','槽楔报警','温度报警','异常预警','气隙预警','槽深预警','槽楔预警','温度预警','正常']
        $scope.warningLight = function (currentState,trainId,trainOnlyId) {
            if (currentState !== 11) {
                if (currentState === 2 || currentState === 7) {
                    $scope.playAlarmAudio();
                } else {
                    $scope.playDeviceAudio();
                }
                if (currentState <= 5) {
                    if ($scope.lightStatus.indexOf(1) === -1) {
                        //报警，红灯信号
                        mainService.triggerLight(1);
                    }
                    $scope.lightStatus.push(1);
                } else {
                    if ($scope.lightStatus.indexOf(1) === -1 && $scope.lightStatus.indexOf(2) === -1) {
                        //报警，cheng灯信号
                        mainService.triggerLight(2);
                    }
                    $scope.lightStatus.push(2);
                }

                var warningInfo = {};
                warningInfo.trainId = trainId;
                warningInfo.trainOnlyId = trainOnlyId;
                $scope.openWarningDialog(warningInfo);
            }
            // }else{
            //     $scope.lightStatus.push(0);
            // }
        };

        $scope.$on("UserChange",
            function (event, user) {
                if (user === "logout") {
                    $scope.currentUser.username = null;
                    $scope.currentUser.userrole = null;
                    return
                }
                $timeout(function () {
                    $scope.currentUser.username = $cookies.get('currentUser');
                    $scope.currentUser.userrole = $cookies.get('currentUserRole');
                }, 300);

            });

        $scope.$on("HideDashboard", function() {
                $scope.showDashboard = false;
            });

        $scope.$on("ShowDashboard", function (event, msg) {
            $scope.showDashboard = true;
            if (msg === "loginsuccess") {
                $scope.getTrainInfo();
                $scope.currentUser.username = $cookies.get('currentUser');
                $scope.currentUser.userrole = parseInt($cookies.get('currentUserRole'));
            }
        });

        $scope.$on("ResizeAuthPage", function (event, msg) {
            if (msg === "fromlocation") {
                $alert.clear();
                $alert.error('请先登录', $rootScope);
            }
            else if (msg === "logout success") {
                $alert.clear();
                $alert.info('登出成功', $rootScope);
            }
            else if (msg === "lose connect") {
                $alert.clear();
                $alert.error('与服务器失去连接', $rootScope);
            }
            else if (msg === "token timeout") {
                $alert.clear();
                $alert.error('登陆状态失效，请重新登陆', $rootScope);
            }
        });


        // call from side-nav
        $scope.toMainPage = function () {
            $rootScope.$broadcast("ShowDashboard");
            $state.go('index.main');
        };

        $scope.openMainDialog = function (index, trainDirection, trainDate) {
            if( !index ) {
                return
            }
            var date = trainDate.slice(0, 4) + '-' + trainDate.slice(4, 6) + '-' + trainDate.slice(6, 8) + ' ' +
                trainDate.slice(8, 10) + ':' + trainDate.slice(10, 12) + ':' + trainDate.slice(12, 14);
            $state.go('index.detailmotordata', {
                trainOnlyId: index,
                trainDirection: trainDirection,
                trainDate: date,
                previousUrl: 'index.main'
            });
            // 移除弹窗
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

        $scope.timeShow = function(trainDate){
            if( !trainDate ){
                $(".dashboard-icon").attr("title","");
                return
            }
            var date = trainDate.slice(0, 4) + '-' + trainDate.slice(4, 6) + '-' + trainDate.slice(6, 8) + ' ' +
                trainDate.slice(8, 10) + ':' + trainDate.slice(10, 12) + ':' + trainDate.slice(12, 14);
            $(".dashboard-icon").attr("title",date);
        };

        $scope.openCurrentdayDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'app/main/currentday-dialog.html',
                controller: 'CurrentdayDialog',
                windowClass: 'app-modal-window'
            });
        };

        $scope.openWarningDialog = function (warningInfo) {
            var modalInstance = $modal.open({
                templateUrl: 'app/main/warning-dialog.html',
                controller: 'WarningDialogController',
                windowClass: 'app-modal-window',
                backdrop: 'static',

                resolve: {
                    warningInfo: function(){
                        return warningInfo;
                    },
                    lightStatus: function(){
                        return $scope.lightStatus;
                    }
                }
            });
        };

        $scope.playDeviceAudio = function () {
            var a = $('<audio/>', {
                style: 'display:none',
                autoplay: 'autoplay',
                src: '../assets/images/device.wav'
            }).appendTo('body')
        };

        $scope.playAlarmAudio = function () {
            var a = $('<audio/>', {
                style: 'display:none',
                autoplay: 'autoplay',
                src: '../assets/images/alarm.wav'
            }).appendTo('body')
        };

        // 整点报时
        var numberToVoice = function(number){
            var voice = [];
            if(number <=10){
                voice.push(number);
            }else if(number > 10 && number < 20){
                voice.push(10);
                voice.push(number % 10);
            }else if(number >= 20){
                voice.push(parseInt(number / 10));
                voice.push(10);
                if(number % 10 !== 0){
                    voice.push(number%10);
                }
            }
            return voice;
        };

        $scope.timeAudio = function (date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var year1 = year % 10;
            var year2 = parseInt(year % 100 / 10);

            var audioFiles = ['xianzaishijian','2','0', year2, year1,'nian'];
            audioFiles = audioFiles.concat(numberToVoice(month));
            audioFiles.push('yue');
            audioFiles = audioFiles.concat(numberToVoice(day));
            audioFiles.push('ri');
            audioFiles = audioFiles.concat(numberToVoice(hour));
            audioFiles.push('dian');

            var audio = document.createElement("audio");
            var audioIdx = 0;
            audio.addEventListener('ended', function () {
                audioIdx++;
                if (audioIdx < audioFiles.length) {
                    this.src = '../assets/images/' + audioFiles[audioIdx] + '.wav';
                    this.play();
                }
            });
            audio.src = '../assets/images/' + audioFiles[audioIdx] + '.wav';
            audio.play();
        };

        $scope.logout = function () {
            if (window.confirm('确定要退出登录?')) {
                $authService.logout();
                $timeout(function () {
                    $rootScope.$broadcast("ResizeAuthPage", "logout success");
                }, 100);
                $state.go('auth')
            }
        };

        $scope.changePassword = function () {
            var modalInstance = $modal.open({
                size: 'md',
                templateUrl: 'app/main/change-password.html',
                controller: 'PasswordChangeController',
                resolve: {
                    username: function () {
                        return $cookies.get('currentUser');
                    }
                }
            });
        };

        $scope.setGapTime = function () {
            var date = new Date();
            var next = new Date();
            next.setHours(date.getHours()+1);
            next.setMinutes(0);
            next.setSeconds(0);
            $scope.gaptime = next - date;
        };

        angular.element(document).ready(function () {
            $('[data-toggle="tooltip"]').tooltip();

            if ($cookies.get('currentUser')) {
                $timeout(function(){
                    $scope.getTrainInfo();
                },500);
                $scope.currentUser.username = $cookies.get('currentUser');
                $scope.currentUser.userrole = parseInt($cookies.get('currentUserRole'));
            }

            $interval(function () {
                // 移除缓存数据
                var date = new Date();
                var h = date.getHours() < 10 ? '0' + (date.getHours()) : '' + (date.getHours());
                var m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : '' + (date.getMinutes());
                if (h + m === "0300") {
                    initTrainsInfo();
                    sessionStorage.removeItem('isRunning');
                    localStorage.removeItem("trainsInfo");
                }
                // if (h + m === "2300") {
                //     $scope.openCurrentdayDialog();
                // }
                $scope.getTrainInfo();
            }, 60 * 1000);

            // 整点报时
            $scope.setGapTime();

            var guid = $timeout(function() {
                var date = new Date();
                next_clock();
                console.log("整点报时：  ", date);
                $scope.timeAudio(date);
                mainService.clockLight();
            }, $scope.gaptime);
            var clock;
            var next_clock = function(){
                $interval(function(){
                    console.log("更新时间间隔")
                    $scope.setGapTime();
                    $timeout.cancel(clock)
                    clock = $timeout(function(){
                        var date = new Date();
                        console.log("整点报时：  ", date);
                        $scope.timeAudio(date);
                        mainService.clockLight();
                    },$scope.gaptime)
                }, 1800 * 1000);
            };
        });
    }
]);


module.controller('CurrentdayDialog', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService) {
        angular.element(document).ready(function () {
            $('.footable-for-dialog').footable({paginate: false});
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

        $scope.$on('CurrentDayRecordUpdate', function (event) {
            $('.footable-for-dialog').footable({paginate: false});
            $('.footable-for-dialog').trigger('footable_redraw');
        });

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
                    $scope.currentDayRecords = data.result;
                    $scope.form.setLoading(false);
                    $scope.form.setLoaded(true);

                    $scope.$broadcast('CurrentDayRecordUpdate');
                    $scope.exportToCsv();
                },
                function (err) {
                    $alert.error(err.error, $scope);
                    $scope.exception = true;
                    $scope.form.setLoading(false);
                }
            )
        };
        $scope.currentDayRecords = [];

        $scope.getCurrentDayData();

        $scope.cancel = function () {
            $modalInstance.close();
        };

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

    }
]);


module.controller('MainDialogController', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'trainOnlyId', 'constants',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, trainOnlyId, $const) {

        $scope.exception = false;
        $scope.line = $const.LINE;
        $scope.form = {
            trainOnlyid: "N/A",
            trainId: "N/A",
            controlNum: "N/A",
            trainDirection: "N/A",
            trainDirection_num: "N/A",

            trainDate: "N/A",
            tempMax: "N/A",
            tempAverage: "N/A",
            lgapMin: "N/A",
            rgapMin: "N/A",
            rgapAverage: "N/A",
            lgapAverage: "N/A",
            rslotMin: "N/A",
            lslotMin: "N/A",
            rslotAverage: "N/A",
            lslotAverage: "N/A",
            rslothMax: 'N/A',
            lslothMax: 'N/A',
            lslothAverage: 'N/A',
            rslothAverage: 'N/A',
            isLoading: false,
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        $scope.getTrainDetail = function (trainOnlyId) {
            $alert.clear();
            $scope.form.setLoading(true);
            mainService.retrieveTrainDetail(trainOnlyId).then(
                function (trainDetail) {
                    if (typeof(trainDetail) === "string") {
                        $alert.error(trainDetail, $scope);

                        $scope.form.setLoading(false);
                        return
                    }
                    $scope.form = trainDetail;

                    $scope.form.trainDirection_num = $scope.form.trainDirection;
                    $scope.form.trainDirection = $scope.form.trainDirection == 0 ? '上行' : '下行';

                    var str = $scope.form.trainDate;
                    $scope.form.trainDate = str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                        str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14);

                    $scope.form.trainState = $const.TRAIN_STATE[$scope.form.trainState - 1];
                    $scope.form.isLoading = false;

                },
                function (err) {
                    $scope.form.setLoading(false);
                }
            )
        };

        $scope.getTrainDetail(trainOnlyId);

        $scope.cancel = function () {
            $modalInstance.close();
        };

        $scope.confirm = function () {
            $state.go('index.detailmotordata', {
                trainOnlyId: trainOnlyId,
                trainDirection: $scope.form.trainDirection_num,
                trainDate: $scope.form.trainDate
            });
            $modalInstance.close();
        };
    }
]);

module.controller('WarningDialogController', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'constants', 'warningInfo','lightStatus',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, $const, warningInfo, lightStatus) {

        angular.element(document).ready(function () {
            $('.footable-for-warning').footable({paginate: false});
        });

        $scope.$on('WarningRecordUpdate', function (event) {
            $timeout(function () {
                $('.footable-for-warning').trigger('footable_redraw');
            }, 100);
        });

        $scope.exception = false;
        $scope.form = {
            isLoading: false,
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        $scope.getAbnormalState = function (trainOnlyId) {
            $alert.clear();

            $scope.form.setLoading(true);
            mainService.retrieveAbnormalState(trainOnlyId).then(
                function (abnormalInfo) {
                    if (typeof(abnormalInfo) === "string") {
                        $alert.error(abnormalInfo, $scope);
                        $scope.form.setLoading(false);
                        $timeout(function () {
                            $modalInstance.close();
                        }, 10 * 1000);
                        return
                    }
                    var record = {};
                    var str;
                    for (var idx = 0; idx < abnormalInfo.length; idx++) {
                        record.trainId = warningInfo.trainId;
                        record.faultType = $const.TRAIN_STATE[abnormalInfo[idx].faultType - 1];
                        str = abnormalInfo[idx].trainDate;
                        record.trainDate = str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8) + ' ' +
                            str.slice(8, 10) + ':' + str.slice(10, 12) + ':' + str.slice(12, 14);
                        $scope.warningRecords.push(record);
                        record = {};
                    }
                    $scope.$broadcast('WarningRecordUpdate');

                    $scope.form.setLoading(false);
                },
                function (err) {
                    $scope.form.setLoading(false);
                }
            )
        };
        $scope.warningRecords = [];

        $scope.getAbnormalState(warningInfo.trainOnlyId);

        $scope.cancel = function () {
            $modalInstance.close();
            // var status = lightStatus.pop();
            // if( status === 1 && lightStatus.indexOf(1) === -1){
            //     if(lightStatus.indexOf(2) !== -1){
            //         //baojing  chengsebaojing
            //         mainService.triggerLight(2);
            //     }else{
            //         //huifuzhencghangyanse
            //         mainService.triggerLight(0);
            //     }
            // }
            // if( status === 2 && lightStatus.indexOf(1) === -1 && lightStatus.indexOf(2) === -1){
            //     //恢复
            //     mainService.triggerLight(0);
            //
            // }
        };
        $scope.$on('modal.closing', function(){
            var status = lightStatus.pop();

            if( lightStatus.length === 0 ){
                mainService.triggerLight(0);
            }
        })
    }
]);

module.controller('PasswordChangeController', [
    '$scope', '$state', '$rootScope', '$timeout', '$uibModalInstance', 'Alert', 'MainService', 'username',
    function ($scope, $state, $rootScope, $timeout, $modalInstance, $alert, mainService, username) {
        $scope.exception = false;
        $scope.form = {
            username: username,
            oldPassword: '',
            newPassword1: '',
            newPassword2: '',
            isLoading: false,
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        $scope.changePassword = function () {
            $alert.clear();
            if ($scope.form.username && $scope.form.newPassword1 && $scope.form.newPassword2 && $scope.form.oldPassword) {
                if ($scope.form.newPassword1 != $scope.form.newPassword2) {
                    $alert.error("输入的密码不一致");
                    return
                }
            } else {
                $alert.error("输入项不能为空");
                return
            }

            var user = {};
            user.username = $scope.form.username;
            user.oldPassword = $scope.form.oldPassword;
            user.newPassword = $scope.form.newPassword1;

            $scope.form.setLoading(true);
            mainService.changePassword(user).then(
                function (code) {
                    if (code == -1) {
                        $alert.error("密码更改失败", $scope);
                        $scope.form.setLoading(false);
                        return
                    } else {
                        $alert.error("密码更改成功，即将关闭弹窗", $scope);
                        $scope.form.setLoading(false);
                        $timeout(function () {
                            $modalInstance.close();
                            $scope.form.setLoading(false);
                        }, 1000);
                    }
                },
                function (err) {
                    $scope.exception = true;
                    $scope.form.setLoading(false);
                }
            )
        };

        $scope.cancel = function () {
            $modalInstance.close();
        };
    }
]);






