# Mailgun Appender for Log4JS

This is an optional appender for [log4js-node](https://log4js-node.github.io/log4js-node/).

```bash
npm install @log4js-node/mailgun
```

This appender uses the [mailgun](https://www.mailgun.com) service to send log messages as emails. It uses the [mailgun-js](https://www.npmjs.com/package/mailgun-js) package.

## Configuration

* `type` - `@log4js-node/mailgun`
* `apiKey` - `string` - your mailgun API key
* `domain` - `string` - your domain
* `from` - `string`
* `to` - `string`
* `subject` - `string`
* `layout` - `object` (optional, defaults to basicLayout) - see [layouts](layouts.md)

The body of the email will be the result of applying the layout to the log event. Refer to the mailgun docs for how to obtain your API key.

## Example

```javascript
log4js.configure({
  appenders: {
    type: '@log4js-node/mailgun',
    apiKey: '123456abc',
    domain: 'some.company',
    from: 'logging@some.service',
    to: 'important.bosses@some.company',
    subject: 'Error: Developers Need To Be Fired'
  }
});
```
