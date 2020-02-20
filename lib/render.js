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

  // TODO:
  // 1. add a client side landing page that would be publicly available, but accept redirect url
  // (point of it is to push the auth parameters in the QS and redirect to the PDFable page)
  // 2. call this endpoint and pass in the URL of that auth landing page appending the current user's creds
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
