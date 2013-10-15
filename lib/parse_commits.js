'use strict';

var debug = require('debug')('parse_commits');

function parseCommits(commitMsgs) {
  var bugNums = [],
    bug_re = /bug *(\d+)/gi,
    result;
  for (var i = 0; i < commitMsgs.length; i++) {
    while (result = bug_re.exec(commitMsgs[i].msg)) {
      bugNums.push(result[1]);
      debug('Found a bug: %d', result[1]);
    }
    if (bugNums.length === 0) {
      debug('Found no bug in commit %s', commitMsgs[i].sha);
      continue;
    }
  }
  return bugNums;
}

exports.parseCommits = parseCommits;
