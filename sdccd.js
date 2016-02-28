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
  TimeBlock.set({
    day: 0,
    start: {h: 9, m: 45},
    end: {h: 13, m: 20},
    color: 'red'
  });
})

.factory('Schedule', function(TimeBlock, Days, Times) {
  var blocks = {};
  var removeBlock = function(name) {
    delete blocks[name];
  };
  var addBlock = function(name, timeBlocks) {
    blocks[name] = timeBlocks;
  };

  return {
    remove: removeBlock,
    get: function() { return classes; },
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

  var set = function(block) {
    var day = Days[block.day];
    var start = block.start;
    var end = block.end;
    var color = block.color;

    var borderStyle = '0px groove ';

    if (!blocks[day])
      blocks[day] = {};
    console.log(Times[start.h - 7]);
    var startHour = Times[start.h - 7];
    blocks[day][startHour] = {
      'background-color': color,

      'border': borderStyle + color,

      // offset of start
      'top': toPixels(start.m),

      // size of block
      'height': blockSize(start, end)

    };
  };

  return {
    get: get,
    set: set
  }
})

;
