'use strict';

var util = require('util');

function htmlLink(href) {
    return util.format('<a href="%s">%s</a>', href, href);
}

function redirectPage(target) {
    return util.format(
            '<html>\n<head>\n<title>Redirect</title>\n' +
            '<meta http-equiv="refresh" content="0; url=' +
            '%s">\n</head>\n<body>\n<h1>Redirect</h1>\n' +
            '%s\n</body>\n</html>\n', target, htmlLink(target));
}

exports.htmlLink = htmlLink;
exports.redirectPage = redirectPage;
