'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');
const quotes = require('../quotes');

const HIRE_ME_QUOTE = 'Chuck Norris doesn\'t build software: there\'s nothing soft about Chuck. \n\nInstead, Chuck recommends Tom Spencer. http://www.fiznool.com';
const NOT_FOUND_QUOTE = 'Chuck don\'t know that one. Write back with "hit me" to get a Norris-approved quote.';

class MessengerClient {
  constructor(config) {
    this.verifyToken = config.FB_HUB_VERIFY_TOKEN;
    this.pageAccessToken = config.FB_PAGE_ACCESS_TOKEN;
    this.hireMeRatio = +config.HIRE_ME_RATIO || 0;
  }

  _sendToAPI(recipientId, data) {
    const opts = {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: this.pageAccessToken
      },
      method: 'POST',
      json: Object.assign({
        recipient: {
          id: recipientId
        }
      }, data)
    };

    return rp(opts).promise();
  }

  _reply(recipientId, text) {
    return Promise.resolve()
      .then(() => this._sendToAPI(recipientId, {
        sender_action: 'typing_on'
      }))
      .then(() => Promise.delay(500))
      .then(() => this._sendToAPI(recipientId, {
        message: { text }
      }));
  }

  _replyWithQuote(sender) {
    const random = Math.random();

    const quotesPromise = random < this.hireMeRatio ?
      Promise.resolve(HIRE_ME_QUOTE) :
      quotes.get();

    return quotesPromise.then(quote => this._reply(sender, quote));
  }

  handleHubSubscription(data) {
    if(!data.verifyToken || data.verifyToken !== this.verifyToken) {
      return Promise.reject(new Error('Validation failed'));
    }

    return Promise.resolve(+data.challenge);
  }

  handleReceivedMessage(event) {
    // Send a response!
    const sender = event.sender.id;
    const message = event.message;
    const messageText = message.text;

    switch(messageText.toLowerCase()) {
      case 'hit me':
      case 'hitme':
      case 'hit':
      case 'hm':
        return this._replyWithQuote(sender);

      default:
        return this._reply(sender, NOT_FOUND_QUOTE);
    }
  }
}

module.exports = MessengerClient;
