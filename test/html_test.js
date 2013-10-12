'use strict';

suite('html', function() {
  var subject = require('../lib/html.js'),
      href = 'http://google.com';

  test('htmlLink', function() {
      var link = subject.htmlLink(href);
      assert.ok(-1 != link.indexOf(href));
  });

  test('redirectPage', function() {
    var redirectPage = subject.redirectPage(href);
    assert.ok(-1 !== redirectPage.indexOf('url=' + href));
    assert.ok(-1 !== redirectPage.indexOf('http-equiv="refresh"'));
  });
});
