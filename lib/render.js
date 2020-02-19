const htmlPdf           = require('html-pdf-chrome')
const debug             = require('debug')
const uuid              = require('uuid')
const meta              = require('./meta')
const PrintOptions      = require('./pdf/print-options')
const CompletionTrigger = require('./pdf/completion-trigger')

module.exports = class Render {
  constructor(htmlString, options) {
    this.htmlString = htmlString
    this.options  = options || {}

    this.log = debug(this.options.log || 'breezy-pdf-lite:pdf')
  }

  toPdf() {
    const renderOptions = {
      completionTrigger: this.completionTrigger(),
      printOptions:      this.printOptions(),
      host:              'localhost',
      port:              9222
    }

    this.log(`Generating PDF for HTML string with options: ${JSON.stringify(renderOptions)}`)

    return htmlPdf.create(this.htmlString, renderOptions)
  }

  // TODO:
  // 1. add a client side landing page that would be publicly available, but accept redirect url
  // (point of it is to push the auth parameters in the QS and redirect to the PDFable page)
  // 2. call this endpoint and pass in the URL of that auth landing page appending the current user's creds

  toPdfSecureUrl(token, uid, client, tokenType, expiry){
    // if (!token || !uid || !client || !tokenType || !expiry){
    //   this.log(`No secure parameters passed`);
    //   return;
    // }

    const renderOptions = {
      completionTrigger: this.completionTrigger(),
      printOptions:      this.printOptions(),
      host:              'localhost',
      port:              9222,
      // cookies: [
      //   { name: "pdf-access-token", value: token, domain: '.finlink.internal' },
      //   { name: "pdf-uid", value: uid, domain: '.finlink.internal' },
      //   { name: "pdf-client", value: client, domain: '.finlink.internal' },
      //   { name: "pdf-token-type", value: tokenType, domain: '.finlink.internal' },
      //   { name: "pdf-expiry", value: expiry, domain: '.finlink.internal' }, ]
    }

    this.log(`Generating PDF for URL with secure options`);
    return htmlPdf.create(this.htmlString, renderOptions)
  }

  meta() {
    if (this.metadata === undefined) {
      this.metadata = meta(this.htmlString)
    }

    return this.metadata
  }

  filename() {
    return `${this.meta().filename || uuid()}.pdf`
  }

  printOptions() {
    return new PrintOptions(this.meta()).build()
  }

  completionTrigger() {
    return new CompletionTrigger(this.meta()).build()
  }
}
