suite('attachment_check', function() {
  var consts = require('../lib/consts'),
      subject = require('../lib/pull_request_attached');

  function fixtureFactory(content, contentType) {
    return {
      data: new Buffer(content).toString('base64'),
      content_type: contentType || consts.GITHUB_PULL_TYPE
    };
  }

  var user = 'user',
      repo = 'repo',
      number = 1;

  test('no attachments', function() {
    assert(!subject(user, repo, number, []));
  });

  test('no github attachments', function() {
    var fixture = [fixtureFactory('woot', 'text/plain')];
    assert(!subject(user, repo, number, fixture));
  });

  test('different pull request', function() {
    var fixture = [fixtureFactory('https://github.com/user/repo/pull/3')];
    assert(!subject(user, repo, number, fixture));
  });

  test('already attached pull request', function() {
    var fixture = [fixtureFactory('https://github.com/user/repo/pull/1')];
    assert(subject(user, repo, number, fixture));
  });
});
