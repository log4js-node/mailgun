'use strict';

const debug = require('debug')('log4js:mailgun');
const mailgunFactory = require('mailgun-js');

debug('module loaded');

function mailgunAppender(config, layout) {
  const mailgun = mailgunFactory({
    apiKey: config.apiKey || config.apikey,
    domain: config.domain
  });

  debug('Mailgun appender created.');

  return (loggingEvent) => {
    const data = {
      from: config.from,
      to: config.to,
      subject: config.subject,
      text: layout(loggingEvent, config.timezoneOffset)
    };

    debug('Sending messages to mailgun');
    mailgun.messages().send(data, (error) => {
      if (error) {
        console.error('log4js.mailgunAppender - Error happened', error); // eslint-disable-line
      }
    });
  };
}

function configure(config, layouts) {
  debug('Creating mailgun appender');
  let layout = layouts.basicLayout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  return mailgunAppender(config, layout);
}

module.exports.configure = configure;
