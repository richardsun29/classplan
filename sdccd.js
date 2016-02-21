angular.module('ClassPlan', [])

.constant('Days', [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
])

.constant('Times', (function() {
  var times = [];

  var start = 7; // 7 AM
  var end = 22; // 10 PM

  for (var i = start; i <= end; i++) {
    if (i < 12)
      times.push(i + ' AM');
    else if (i == 12)
      times.push('12 PM');
    else
      times.push((i-12) + ' PM');
  }
  return times; // ['7 AM', '8 AM', ..., '10 PM']
})())

.controller('TableCtrl', function($scope, Days, Times, TimeBlock) {
  $scope.days = Days;
  $scope.times = Times;
  $scope.classBlock = TimeBlock.get();
  TimeBlock.set(Days[0], {h: 9, m: 45}, {h: 13, m: 20}, 'red');
})

.factory('TimeBlock', function(Days, Times) {
  var blocks = {};

  var get = function() {
    return blocks;
  };

  /* minutes -> percent */
  var toPercent = function(minutes) {
    return (minutes / 60 * 100) + '%';
  };

  /* time difference */
  var blockSize = function(start, end) {
    var diff = (end.h - start.h) * 60 + (end.m - start.m); // minutes
    return toPercent(diff);
  };

  var set = function(day, startTime, endTime, color) {
    var borderStyle = '0px groove ';

    if (!blocks[day])
      blocks[day] = {};

    var timeString = Times[startTime.h - 7];
    blocks[day][timeString] = {
      'background-color': color,

      'border': borderStyle + color,

      // offset of start
      'top': toPercent(startTime.m),

      // size of block
      'height': blockSize(startTime, endTime)

    };
  };

  return {
    get: get,
    set: set
  }
})

;
