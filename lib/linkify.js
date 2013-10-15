'use strict';

var debug = require('debug')('linkify'),
    html = require('./html'),
    parseCommits = require('./parse_commits'),
    states = require('./states'),
    util = require('util');

function attachFile(bz, bugNum, attachment, callback) {
  bz.createAttachment(bugNum, attachment, function(err, data) {
    if (err) {
      var errObj = new Error('Error creating attachment: ' + err);
      debug(errObj);
      return callback(errObj);
    }
    debug('Created attachment: ' + data);
    // FIXME: We should figure out how to pass data from tasks to
    //        whatever is running the task for insertion into status
    //        reporting
    return callback(null, true, {attachmentId: data});
  });
}

function createRedirect(bz, github, user, repo, prNum, bugNum, callback) {
  var msg = {user: user, repo: repo, number: prNum};

  github.pullRequests.get(msg, function(err, data) {
    if (err) {
      var errObj = new Error('Error fetching PRs:' + err);
      debug(errObj);

      return callback(errObj);
    }

    var contents = new Buffer(html.redirectPage(data.html_url))
               .toString('base64');

    var prComment = util.format(
        'Github user %s has opened a pull request for %s\n\n%s',
        data.user.login, data.base.label, data.html_url);

    var fileName = util.format(
      '%s_pull_request_%d.html', data.base.repo.name.replace(' ', '_'),
      data.number
    );

    var attachment = {
      bug_id: bugNum,
      comments: [{ text: prComment }],
      encoding: 'base64',
      data: contents.toString('base64'),
      description: data.base.label + ' PR#' + data.number,
      file_name: fileName,
      content_type: 'text/html'
    };

    if (process.env.DEBUG) {
      debug('Github API Response: %s', JSON.stringify(data));
      debug('Attachment Object: %s', JSON.stringify(attachment));
    }

    return attachFile(bz, bugNum, attachment, callback);

  });
}

function link(bz, github, user, repo, prNum, callback) {
  debug('Creating BZ->GH link from %s:%s to bug %s', user, repo);

  var msg = { user: user, repo: repo, number: prNum, per_page: 100 };

  github.pullRequests.getCommits(msg, function(err, data) {
    if (err) {
      var errObj = new Error('Error getting commits for PR: ' + err);
      debug(errObj);

      return callback(errObj);
    }
    var commitMsgs = [],
      bugNums;

    if (process.env.DEBUG) {
      debug('Github API Response: %s', JSON.stringify(data));
    }

    for (var i = 0; i < data.length; i++) {
      commitMsgs.push({
        msg: data[i].commit.message,
        sha: data[i].sha
      });
    }
    bugNums = parseCommits.parseCommits(commitMsgs);
    debug('Found bugs: ' + bugNums);
    if (bugNums.length < 1) {
      return callback(
          null,
          false,
          states.LINK_NO_BUG);
    }
    return createRedirect(bz, github, user, repo,
             prNum, bugNums[0], callback);
  });
}

exports.link = link;
exports.attachFile = attachFile;
exports.createRedirect = createRedirect;
