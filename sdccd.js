angular.module('ClassPlan', [])

.constant('Days', [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
])

.constant('Times', [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM',
  '5 PM', '6 PM'
])

.controller('TableCtrl', function($scope, Days, Times) {
  $scope.days = Days;
  $scope.times = Times;

})

;
