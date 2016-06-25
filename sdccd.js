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

.controller('TableCtrl', function($scope, Days, Times, TimeBlock, Schedule) {
  $scope.days = Days;
  $scope.times = Times;
  $scope.classBlock = TimeBlock.get();
  Schedule.addClass(0,
      'Math\nCalc',
      {M: true, W: false, F: true},
      {h:9, m:45},
      {h:12,m:0},
      'blue');
  Schedule.addClass(1,
      'Math\nCalc',
      {M: false, T: true, F: true},
      {h:13, m:45},
      {h:15,m:0},
      'red');
})

/*
    classes[id] = {
        label: label,
        days: days,
        start: start,
        end: end,
        color: color
    };
*/

.controller('InputCtrl', function($scope, Schedule) {
  $scope.schedule = [];

  $scope.addClass = function() {
    var sevenAM = new Date(0);
    sevenAM.setHours(7);
    var eightAM = new Date(0);
    eightAM.setHours(8);

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
      start: sevenAM,
      end: eightAM,
      color: randColor(),
    };

    $scope.schedule.push(defaultClass);

    console.log($scope.schedule);
  };

  $scope.deleteClass = function(index) {
    $scope.schedule.splice(index, 1);
  }

  //$scope.schedule = Schedule.get();
})

.factory('Schedule', function(TimeBlock, Days, Times) {
  var classes = {};

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

  /* Add or overwrite a class
   * id: unique number
   * days: {M: true, T: undefined,W,R,F}
   * start, end: {h, m}
   * color: CSS color string
   */
  var addClass = function(id, label, days, start, end, color) {
    removeClass(id); // do any cleanup needed

    classes[id] = {
        label: label,
        days: days,
        start: start,
        end: end,
        color: color
    };

    for (var day in days) {
      if (!days[day]) continue;

      var block = {
        label: label,
        day: day2ind(day),
        start: start,
        end: end,
        color: color
      };

      TimeBlock.add(block);
    }
  };

  var removeClass = function(id) {
    var curr = classes[id];

    if (!curr) return;

    for (var day in curr.days) {
      if (curr.days[day])
        TimeBlock.remove(day2ind(day), curr.start.h);
    }
    delete classes[id];
  };

  return {
    addClass: addClass,
    removeClass: removeClass,
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
    var diff = (end.h - start.h) * 60 + (end.m - start.m); // minutes
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
    var startHour = Times[start.h - 7];

    if (!blocks[day])
      blocks[day] = {};

    // create new block's style
    var style = {
      'background-color': color,

      'border': borderStyle + color,

      // offset of start
      'top': toPixels(start.m),

      // size of block
      'height': blockSize(start, end)

    };

    blocks[day][startHour] = {
      style: style,
      label: label
    };
  };

  var removeBlock = function(day, startHour) {
    startHour = Times[startHour - 7];
    day = Days[day];
    delete blocks[day][startHour];
  };

  return {
    get: get,
    add: add,
    remove: removeBlock
  };
})

;
