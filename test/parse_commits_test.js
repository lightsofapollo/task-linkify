'use strict';

suite('parse_commits', function() {

  var subject = require('../lib/parse_commits');

  var noBugCommitMsg = {
      sha: 'abc1234',
      msg: 'no bugs, still no bugs'
  };

  var oneBugCommitMsg = {
      sha: 'abc123',
      msg: 'Bug 1234'
  };

  var anotherOneBugCommitMsg = {
      sha: 'abc456',
      msg: 'bug 5678'
  };

  var twoBugCommitMsg = {
      sha: 'abc1235',
      msg: 'bug 1234 and bug 5678'
  };

  test('no bug', function() {
    assert.deepEqual([], subject.parseCommits([noBugCommitMsg]));
  });

  test('one bug, one commit', function() {
    assert.deepEqual(
      [1234],
      subject.parseCommits([oneBugCommitMsg, noBugCommitMsg]));
  });

  test('two bugs, one commit', function() {
    assert.deepEqual(
      [1234, 5678],
      subject.parseCommits([twoBugCommitMsg, noBugCommitMsg]));
  });

  test('two bugs, two commits', function() {
    assert.deepEqual(
      [1234, 5678],
      subject.parseCommits(
        [oneBugCommitMsg, noBugCommitMsg, anotherOneBugCommitMsg]
      ));
  });

  test('two bugs, two commits reversed', function() {
    assert.deepEqual(
      [5678, 1234],
      subject.parseCommits(
        [anotherOneBugCommitMsg,
         noBugCommitMsg,
         oneBugCommitMsg]
      ));
  });
});
