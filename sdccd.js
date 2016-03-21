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
  Schedule.addClass(0, 'Math\nCalc', 'MWF', {h:9, m:45}, {h:12,m:0}, 'blue');
  /*TimeBlock.add({
    label: 'Math 145\nCalculus',
    day: 0,
    start: {h: 9, m: 45},
    end: {h: 13, m: 20},
    color: 'red'
  });*/
})

.factory('Schedule', function(TimeBlock, Days, Times) {
  var classes = {};

  /* Add or overwrite a class
   * id: unique number
   * days: string of 'MTWRF'
   * start, end: {h, m}
   * color: CSS color string
   */
  var addClass = function(id, label, days, start, end, color) {
    classes[id] = [];
    for (var i in days) {
      var day;
      switch(days[i]) {
        case 'M': day = 0; break;
        case 'T': day = 1; break;
        case 'W': day = 2; break;
        case 'R': day = 3; break;
        case 'F': day = 4; break;
        default: console.error("Unknown day in", days);
      }
      var block = {
        label: label,
        day: day,
        start: start,
        end: end,
        color: color
      };
      classes[id].push(block);
      TimeBlock.add(block);
    }
  };

  return {
    addClass: addClass,
    removeClass: function(id) { delete classes[id] },
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
    return toPercent(diff);
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

  return {
    get: get,
    add: add
  }
})

;
