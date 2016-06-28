'use strict';
angular.module('ClassPlan', [])

.constant('Days', [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
])

.constant('Times', (function() {
  var times = [];

  var start = 5; // 5 AM
  var end = 23; // 11 PM

  for (var i = start; i <= end; i++) {
    if (i < 12)
      times.push(i + ' AM');
    else if (i == 12)
      times.push('12 PM');
    else
      times.push((i-12) + ' PM');
  }
  return times; // ['5 AM', '6 AM', ..., '11 PM']
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

  // TODO: throttle updates
  $scope.$watch('schedule', function(newSchedule) {
    Schedule.set(newSchedule);
  }, true);
})

.factory('Schedule', function(TimeBlock, Days, Times) {
  //var classes = {};

  var day2ind = function(day) {
      switch(day) {
        case 'M': return 0;
        case 'T': return 1;
        case 'W': return 2;
        case 'Th': return 3;
        case 'F': return 4;
        case 'S': return 5;
        case 'Su': return 6;
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

  var darken = function(color, amt) {
    var num = parseInt(color.slice(1), 16);
    var r = (num >> 16) - amt;
    if (r < 0) r = 0;
    var b = ((num >> 8) & 0xff) - amt;
    if (b < 0) b = 0;
    var g = (num & 0xff) - amt;
    if (g < 0) g = 0;
    var str = (g + (b * 256) + (r * 256*256)).toString(16);
    while (str.length < 6)
      str = '0' + str;
    return '#' + str;
  }

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

    //var borderStyle = '2px solid ';
    var startHour = Times[start.getHours() - 5];

    blocks[day] = blocks[day] || {};
    blocks[day][startHour] = blocks[day][startHour] || [];

    // create new block's style
    var style = {
      'background-color': color,

      //'border': borderStyle + darken(color, 20),

      // offset of start
      'top': toPixels(start.getMinutes()),

      // size of block
      'height': blockSize(start, end),
    };

    // styles for inner span
    var spanStyle = {
      'height': (function() {
        var h = parseInt(style.height.slice(0, -2));
        return (h - 10).toString() + 'px';
      })()
    };

    blocks[day][startHour].push({
      style: style,
      spanStyle: spanStyle,
      label: label
    });
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
