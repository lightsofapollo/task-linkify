var consts = require('./consts');

function checkAttachment(url, attachment) {
  // only check github types
  if (attachment.content_type !== consts.GITHUB_PULL_TYPE) return;

  // decode data
  var data = new Buffer(attachment.data, 'base64').toString();
  return data.indexOf(url) !== -1;
}

/**
Checks the given attachments to see if we already created a link from a bug to a
github pull request.

@param {String} user github user.
@param {String} repo github repo .
@param {Number} number github pull request number.
@param {Array[Object]} attachments for bug.
@return {Boolean} true when already attached false otherwise.
*/
function check(user, repo, number, attachments) {
  var url = user + '/' + repo + '/pull/' + number;
  return attachments.some(checkAttachment.bind(this, url));
}

// exposed as a property mostly so we can mock it.
module.exports = check;
