'use strict';

const quotes = require('./lib/quotes');

exports.getNorrisQuote = (event, context, cb) => {
  quotes.get().then(
    message => cb(null, { message }),
    err => cb(err)
  );
};
