'use strict';

var sinon = require('sinon');

suite('linkify', function() {

  var subject = require('../lib/linkify'),
      states = require('../lib/states.js');

  var goodBZStub = {
    createAttachment: sinon.stub().callsArgWithAsync(2, null, 123456)
  };

  var badBZStub = {
    createAttachment: sinon.stub().callsArgWithAsync(2, true, null)
  };

  var githubPR = {
    user: { login: 'testUser' },
    base: {
      label: 'testOrg:testRepo',
      repo: { name: 'testRepo' }
    },
    number: 75,
    html_url: 'http://www.example.com'
  };

  var ghCommitList = [{
    sha: 'abc1234',
    commit: { message: 'bug 123456: test bug' }
  }];

  var ghNoBugsCommitList = [{
    sha: 'abc5678',
    commit: { message: 'there ain\'t no id here' }
  }];

  var goodGithubStub = {
    pullRequests: {
      get: sinon.stub().callsArgWithAsync(1, null, githubPR),
      getCommits: sinon.stub().callsArgWithAsync(1, null, ghCommitList)
    }
  };

  var badGithubStub = {
    pullRequests: {
      get: sinon.stub().callsArgWithAsync(1, true, null),
      getCommits: sinon.stub().callsArgWithAsync(1, true, null)
    }
  };

  var mediocreGithubStub = {
    pullRequests: {
      get: badGithubStub.pullRequests.get,
      getCommits: goodGithubStub.pullRequests.getCommits
    }
  };

  var noBugNumberGithubStub = {
    pullRequests: {
      get: sinon.stub().callsArgWithAsync(1, true, null),
      getCommits: sinon.stub().callsArgWithAsync(1, null, ghNoBugsCommitList)
    }
  };


  test('attachFile() Success', function(done) {
    subject.attachFile(
      goodBZStub,
      123456,
      {},
      function(err, outcome, data) {
        assert.ok(outcome);
        assert.ok(data.attachmentId === 123456);
        done(err);
      });
  });

  test('attachFile() Failure', function(done) {
    subject.attachFile(
      badBZStub,
      123456,
      {},
      function(err, outcome, data) {
        assert.ok(err instanceof Error);
        assert.ok(-1 !== err.message.indexOf('Error creating attachment'));
        done();
      });
  });

  test('createRedirect() Success', function(done) {
    subject.createRedirect(
      goodBZStub,
      goodGithubStub,
      'testOrg',
      'testRepo',
      75,
      123456,
      function(err, outcome, data) {
        assert.ok(outcome);
        assert.ok(data.attachmentId === 123456);
        done(err);
      });
  });

  test('createRedirect() Github Failure', function(done) {
    subject.createRedirect(
      goodBZStub,
      badGithubStub,
      'testOrg',
      'testRepo',
      75,
      123456,
      function(err, outcome, data) {
        assert.ok(err instanceof Error);
        assert.ok(-1 !== err.message.indexOf('Error fetching PRs'));
        done();
      });
  });

  test('link() Success', function(done) {
    subject.link(
      goodBZStub,
      goodGithubStub,
      'testOrg',
      'testRepo',
      75,
      function(err, outcome, data) {
        assert.ok(outcome);
        assert.ok(data.attachmentId === 123456);
        done(err);
      });
  });

  test('link() Github Failure', function(done) {
    subject.link(
      goodBZStub,
      badGithubStub,
      'testOrg',
      'testRepo',
      75,
      function(err, outcome, data) {
        assert.ok(err instanceof Error);
        assert.ok(-1 !==
          err.message.indexOf('Error getting commits for PR'));
        done();
      });
  });

  test('link() Github Partial Failure', function(done) {
    subject.link(
      goodBZStub,
      mediocreGithubStub,
      'testOrg',
      'testRepo',
      75,
      function(err, outcome, data) {
        assert.ok(err instanceof Error);
        assert.ok(-1 !==
          err.message.indexOf('Error fetching PRs'));
        done();
      });
  });

  test('link() BZ Failure', function(done) {
    subject.link(
      badBZStub,
      goodGithubStub,
      'testOrg',
      'testRepo',
      75,
      function(err, outcome, data) {
        assert.ok(err instanceof Error);
        assert.ok(-1 !==
          err.message.indexOf('Error creating attachment'));
        done();
      });
  });

  test('link() No bugs found', function(done) {
    subject.link(
      goodBZStub,
      noBugNumberGithubStub,
      'testOrg',
      'testRepo',
      75,
      function(err, outcome, data) {
        assert.ok(!outcome);
        assert.deepEqual(data, states.LINK_NO_BUG);
        done(err);
      });
  });

});
