var linkify = require('./lib/linkify'),
    bz = require('bz'),
    githubFactory = require('./lib/github'),
    debug = require('debug')('task-linkify:task');

/**
Create a link file on Bugzilla to a Github PR

@param {Object} options for task.
@param {String} options.user which the repo is under.
@param {String} options.repo name of the repo.
@param {Number} options.number pull request #
@param {Object} options.bugzillaConfig bugzilla api configuration.
@param {String} [options.oauthToken] oAuth token for github authentication.
@param {Function} callback [Error, Object]
*/
function task(options, callback) {
  debug('request', options);
  if (!options.user || !options.repo || !options.number) {
    throw new Error('missing a required option');
  }

  // bugzilla rest api interface
  var bugzilla = bz.createClient(options.bugzillaConfig || {});

  // github rest interface api
  var github = githubFactory.create();

  // authenticate with Github
  if (options.oauthToken) {
    github.authenticate({ type: 'oauth', token: options.oauthToken });
    debug('authenticate with oauth');
  }

  var prNum = options.number,
      user = options.user,
      repo = options.repo;


  linkify.link(bugzilla, github, user, repo, prNum, callback);
}

module.exports = task;
