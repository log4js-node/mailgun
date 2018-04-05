'use strict';

const test = require('tap').test;
const util = require('util');
const sandbox = require('@log4js-node/sandboxed-module');
const appender = require('../../lib');

function setupLogging(options, error) {
  const msgs = [];

  let mailgunCredentials;

  const fakeMailgun = function (credentials) {
    mailgunCredentials = credentials;
    return {
      messages: function () {
        return {
          config: options,
          send: function (data, callback) {
            msgs.push(data);
            callback(error, { status: 'OK' });
          }
        };
      }
    };
  };

  const justTheData = evt => util.format.apply(util, evt.data);

  const fakeLayouts = {
    layout: function (type, config) {
      this.type = type;
      this.config = config;
      return justTheData;
    },
    basicLayout: justTheData,
    messagePassThroughLayout: justTheData
  };

  const fakeConsole = {
    errors: [],
    error: function (msg, value) {
      this.errors.push({ msg: msg, value: value });
    }
  };

  const appenderModule = sandbox.require('../../lib', {
    requires: {
      'mailgun-js': fakeMailgun
    },
    globals: {
      console: fakeConsole
    }
  });
  options = options || {};

  return {
    appender: appenderModule.configure(options, fakeLayouts),
    mailer: fakeMailgun,
    layouts: fakeLayouts,
    console: fakeConsole,
    mails: msgs,
    credentials: mailgunCredentials
  };
}

function checkMessages(assert, result) {
  result.mails.forEach((mail, i) => {
    assert.equal(mail.from, 'sender@domain.com');
    assert.equal(mail.to, 'recepient@domain.com');
    assert.equal(mail.subject, 'This is subject');
    assert.equal(mail.text, `Log event #${i + 1}`);
  });
}

test('log4js mailgunAppender', (batch) => {
  batch.test('should export a configure function', (t) => {
    t.type(appender.configure, 'function');
    t.end();
  });

  batch.test('mailgun setup', (t) => {
    const result = setupLogging({
      apiKey: 'APIKEY',
      domain: 'DOMAIN',
      from: 'sender@domain.com',
      to: 'recepient@domain.com',
      subject: 'This is subject'
    });

    t.test('mailgun credentials should match', (assert) => {
      assert.equal(result.credentials.apiKey, 'APIKEY');
      assert.equal(result.credentials.domain, 'DOMAIN');
      assert.end();
    });
    t.end();
  });

  batch.test('mailgun setup with old typo', (t) => {
    const result = setupLogging({
      apikey: 'APIKEY',
      domain: 'DOMAIN',
      from: 'sender@domain.com',
      to: 'recepient@domain.com',
      subject: 'This is subject'
    });

    t.test('mailgun credentials should match', (assert) => {
      assert.equal(result.credentials.apiKey, 'APIKEY');
      assert.equal(result.credentials.domain, 'DOMAIN');
      assert.end();
    });
    t.end();
  });

  batch.test('basic usage', (t) => {
    const result = setupLogging({
      apiKey: 'APIKEY',
      domain: 'DOMAIN',
      from: 'sender@domain.com',
      to: 'recepient@domain.com',
      subject: 'This is subject'
    });

    result.appender({ data: ['Log event #1'] });

    t.equal(result.mails.length, 1, 'should be one message only');
    checkMessages(t, result);
    t.end();
  });

  batch.test('config with layout', (t) => {
    const result = setupLogging({
      layout: {
        type: 'tester'
      }
    });
    t.equal(result.layouts.type, 'tester', 'should configure layout');
    t.end();
  });

  batch.test('error when sending email', (t) => {
    const setup = setupLogging({
      apiKey: 'APIKEY',
      domain: 'DOMAIN',
      from: 'sender@domain.com',
      to: 'recepient@domain.com',
      subject: 'This is subject'
    }, { msg: 'log4js.mailgunAppender - Error happened' });

    setup.appender({ data: ['This will break'] });
    const cons = setup.console;

    t.test('should be logged to console', (assert) => {
      assert.equal(cons.errors.length, 1);
      assert.equal(cons.errors[0].msg, 'log4js.mailgunAppender - Error happened');
      assert.end();
    });
    t.end();
  });

  batch.test('separate email for each event', (t) => {
    const setup = setupLogging({
      apiKey: 'APIKEY',
      domain: 'DOMAIN',
      from: 'sender@domain.com',
      to: 'recepient@domain.com',
      subject: 'This is subject'
    });
    setTimeout(() => {
      setup.appender({ data: ['Log event #1'] });
    }, 0);
    setTimeout(() => {
      setup.appender({ data: ['Log event #2'] });
    }, 500);
    setTimeout(() => {
      setup.appender({ data: ['Log event #3'] });
    }, 1100);
    setTimeout(() => {
      t.equal(setup.mails.length, 3, 'should be three messages');
      checkMessages(t, setup);
      t.end();
    }, 3000);
  });

  batch.end();
});
