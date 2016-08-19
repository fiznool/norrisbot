'use strict';

const Promise = require('bluebird');
const quotes = require('./lib/quotes');
const Clients = require('./lib/clients');

exports.getNorrisQuote = (event, context, cb) => {
  quotes.get().then(
    message => cb(null, { message, event }),
    err => cb(err)
  );
};

exports.handleMessengerSubscribeHook = (event, context, cb) => {
  const client = new Clients.Messenger(event.stageVariables);

  if(event.query['hub.mode'] === 'subscribe') {
    return client.handleHubSubscription({
      verifyToken: event.query['hub.verify_token'],
      challenge: event.query['hub.challenge']
    }).asCallback(cb);
  }

  cb(new Error('No handler'));
};

exports.handleMessengerHook = (event, context, cb) => {
  const client = new Clients.Messenger(event.stageVariables);

  const data = event.body;
  if(data.object === 'page' && data.entry) {
    let promise = Promise.resolve();
    data.entry.forEach(function(pageEntry) {
      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if(messagingEvent.message && messagingEvent.message.text) {
          promise = client.handleReceivedMessage(messagingEvent);
        }
      });
    });

    return promise.asCallback(cb);
  }

  cb(new Error('No handler'));
};
