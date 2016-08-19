'use strict';

const rp = require('request-promise');

exports.get = function() {
  const opts = {
    url: 'http://api.icndb.com/jokes/random',
    method: 'GET',
    json: true,
    qs: {
      escape: 'javascript'
    }
  };

  return rp(opts)
    .then(resp => {
      let message = resp && resp.value && resp.value.joke;
      if(!message) {
        message = 'Chuck Norris roundhouse kicked the server. We\'re busy patching it up, try again soon!';
      }
      return message;
    });
};
