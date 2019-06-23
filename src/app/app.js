'use strict';

angular.module('supportAdminApp', [
    'ngMaterial',
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ui.bootstrap',
    'angular-clipboard',
    'ng-file-model',
    'btorfs.multiselect',
    'ui.bootstrap.datetimepicker',
    'angularMoment',
    'angular-jwt',
    "ngAria",
    "ngMessages",
    "mdPickers"])
  .run(
    function run($rootScope, $location, $cookies, $timeout,$http, AuthService) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/auth']) === -1;
            var loggedIn = $cookies.get('currentUser');
            if (restrictedPage && !loggedIn) {
                $location.path('/auth');
                $timeout(function(){
                  $rootScope.$broadcast("ResizeAuthPage","fromlocation");
              },500);
            }else if($location.path() == '/index/main'){
              $rootScope.$broadcast("ShowDashboard");
            }
        });
    }
  )
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('auth', {
        url: '/auth',
        templateUrl: 'app/auth/auth.html',
        controller: 'LoginController',
        data: { pageTitle: 'LoginController' },
      })
    
      .state('index', {
        abstract: true,
        url: '/index',
        templateUrl: 'components/common/content.html'
      })
      .state('index.main', {
        url: '/main',
        templateUrl: 'app/main/blank.html',
        data: { pageTitle: 'Dashboard' },
      })
      .state('index.detailmotordata',{
        url: '/detailmotordata',
        templateUrl: 'app/detail_motor_data/detailmotordata.html',
        controller: 'DetailMotorDataController',
        params: {
          trainOnlyId: null,
          trainDirection: null,
          trainDate: null,
            previousUrl: null
        },
        data: { pageTitle: 'DetailMotorDataController' },
      })
      .state('index.detailmotordataforsearch',{
        url: '/detailmotordatasearch',
        templateUrl: 'app/detail_motor_data_for_search/detailmotordataforsearch.html',
        controller: 'DetailMotorDataForSearchController',
        params: {
          trainOnlyId: null,
          trainDirection: null,
          trainDate: null
        },
        data: { pageTitle: 'DetailMotorDataForSearchController' },
      })
      .state('index.detailmotordataforreport',{
        url: '/detailmotordatareport',
        templateUrl: 'app/detail_motor_data_for_report/detailmotordataforreport.html',
        controller: 'DetailMotorDataForReportController',
        params: {
          trainOnlyId: null,
          trainDirection: null,
          trainDate: null
        },
        data: { pageTitle: 'DetailMotorDataForSearchController' },
      })
      .state('index.reportsearch',{
        url: '/reportsearch',
        templateUrl: 'app/reportsearch/reportsearch.html',
        controller: 'ReportSearchController',
        data: { pageTitle: 'ReportSearchController' },
      })
      .state('index.drivingtable',{
        url: '/drivingtable',
        templateUrl: 'app/drivingtable/drivingtable.html',
        controller: 'DrivingTableController',
        data: { pageTitle: 'DrivingTableController' },
      })
        .state('index.trainoftheday',{
            url: '/trainoftheday',
            templateUrl: 'app/train_of_the_day/train_of_the_day.html',
            controller: 'TrainOfTheDayController',
            data: { pageTitle: 'TrainOfTheDayController' },
        })
      .state('index.toothheighttrend',{
        url: '/toothheighttrend',
        templateUrl: 'app/tooth_height_trend/tooth_height_trend.html',
        controller: 'ToothHeightTrendController',
        data: { pageTitle: 'ToothHeightTrendController' },
      }) 
      .state('index.toothheighttrendchart',{
        url: '/toothheighttrendchart',
        templateUrl: 'app/tooth_height_trend/tooth_height_trend_chart.html',
        controller: 'ToothHeightTrendController',
        data: { pageTitle: 'ToothHeightTrendController' },
      })
        .state('index.temptrendchart',{
            url: '/temptrendchart',
            templateUrl: 'app/temp_trend/temp_trend_chart.html',
            controller: 'TempTrendController',
            data: { pageTitle: 'TempTrendController' },
        })
        .state('index.daydefinitevaluesearch',{
        url: '/daydefinitevaluesearch',
        templateUrl: 'app/day_definite_value_search/day_definite_value_search.html',
        controller: 'DayDefiniteValueSearchController',
        data: { pageTitle: 'DayDefiniteValueSearchController' },
      })   
      .state('index.slottrendencysearch',{
        url: '/slottrendencysearch',
        templateUrl: 'app/slot_trendency_search/slot_trendency_search.html',
        controller: 'SlotTrendencySearchController',
        data: { pageTitle: 'SlotTrendencySearchController' },
      })
      .state('index.slottrendencysearchchart',{
        url: '/slottrendencysearchchart',
        templateUrl: 'app/slot_trendency_search/slot_trendency_search_chart.html',
        controller: 'SlotTrendencySearchChartController',
        data: { pageTitle: 'SlotTrendencySearchController' },
      })
      .state('index.systemconfiguration',{
        url: '/systemconfiguration',
        templateUrl: 'app/system_configuration/system_configuration.html',
        controller: 'SystemConfiguration',
        data: { pageTitle: 'SystemConfiguration' },
      })
      .state('index.systemconfigurationflag',{
        url: '/systemconfigurationflag',
        templateUrl: 'app/system_configuration/system_configuration_flag.html',
        controller: 'SystemConfiguration',
        data: { pageTitle: 'SystemConfiguration' },
      })
        .state('index.devicestatus',{
            url: '/devicestatus',
            templateUrl: 'app/device_status/device_status.html',
            controller: 'DeviceStatus',
            data: { pageTitle: 'DeviceStatus' },
        })
      .state('index.usermanage',{
        url: '/usermanage',
        templateUrl: 'app/user_manage/user_manage.html',
        controller: 'UserMangae',
        data: { pageTitle: 'UserMangae' },
      });

    $urlRouterProvider.otherwise('/index/main');
    // $locationProvider.html5Mode(true).hashPrefix('!');
  });
