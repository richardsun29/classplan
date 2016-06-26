'use strict';
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

.constant('date', function(hours, minutes) {
    var date = new Date(0);
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
})

.controller('TableCtrl',
function($scope, Days, Times, TimeBlock, Schedule, date) {
  $scope.days = Days;
  $scope.times = Times;
  $scope.classBlock = TimeBlock.get();
  Schedule.addClass({
    label: 'Math\nCalc',
    days: {M: true, W: false, F: true},
    start: date(9, 45),
    end: date(12, 0),
    color: 'blue'
  });
  Schedule.addClass({
    label: 'Math\nCalc',
    days: {M: false, T: true, F: true},
    start: date(10, 45),
    end: date(15, 0),
    color: 'red'
  });
})

.controller('InputCtrl', function($scope, Schedule, date) {
  $scope.schedule = [];

  $scope.addClass = function() {

    var randColor = function() {
      // random hex string
      var max = parseInt('ffffff', 16);
      var color = Math.floor(Math.random() * max).toString(16);
      // pad to 6 digits
      while (color.length < 6)
        color = '0' + color;
      return '#' + color;
    };

    var defaultClass = {
      label: "",
      days: {},
      start: date(7, 0),
      end: date(8, 0),
      color: randColor(),
    };

    $scope.schedule.push(defaultClass);
  };

  $scope.deleteClass = function(index) {
    $scope.schedule.splice(index, 1);
  }

  //$scope.schedule = Schedule.get();
  $scope.apply = function() {
    Schedule.set($scope.schedule);
  };
})

.factory('Schedule', function(TimeBlock, Days, Times) {
  //var classes = {};

  var day2ind = function(day) {
      switch(day) {
        case 'M': return 0;
        case 'T': return 1;
        case 'W': return 2;
        case 'R': return 3;
        case 'F': return 4;
        default: console.error("Unknown day in", days);
      }
  };

  /* class = { label: "",
   * days: {'M': true},
   * start: date,
   * end: date,
   * color: '#ffffff'
   * };
   */

  var addClass = function(c) {
    for (var day in c.days) {
      if (!c.days[day])
        continue;

      var block = {
        label: c.label,
        day: day2ind(day),
        start: c.start,
        end: c.end,
        color: c.color
      };

      TimeBlock.add(block);
    }
  };

  var set = function(schedule) {
    TimeBlock.reset();
    schedule.forEach(function(c) {
      addClass(c);
    });
  };

  return {
    addClass: addClass,
    set: set,
    get: function() { return classes; }
  };
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

  /* minutes -> pixels */
  var toPixels = function(minutes) {
    var blockHeight = 50; // 50px
    return (minutes / 60 * blockHeight) + 'px';
  };

  /* time difference */
  var blockSize = function(start, end) {
    var e = {h: end.getHours(), m: end.getMinutes()};
    var s = {h: start.getHours(), m: start.getMinutes()};
    var diff = (e.h - s.h) * 60 + (e.m - s.m); // minutes
    return toPixels(diff);
  };

  /* block = {
   *   day: index of Days,
   *   start: {h, m},
   *   end: {h, m},
   *   color: string,
   * }
   */

  var add = function(block) {
    var label = block.label;
    var day = Days[block.day];
    var start = block.start;
    var end = block.end;
    var color = block.color;

    var borderStyle = '0px groove ';
    var startHour = Times[start.getHours() - 7];

    if (!blocks[day])
      blocks[day] = {};

    // create new block's style
    var style = {
      'background-color': color,

      'border': borderStyle + color,

      // offset of start
      'top': toPixels(start.getMinutes()),

      // size of block
      'height': blockSize(start, end),

      'visibility': 'visible'
    };

    blocks[day][startHour] = {
      style: style,
      label: label
    };
  };

  // clear the calendar, but use the same blocks object
  var reset = function() {
    for (var day in blocks) {
      blocks[day] = {};
    }
  };

  return {
    get: get,
    add: add,
    reset: reset
  };
})

;
