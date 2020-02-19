const express       = require('express')
const bodyParser    = require('body-parser')
const debug         = require('debug')
const Authorization = require('./authorization')
const Render        = require('./render')

module.exports = class Server {
  constructor(options) {
    this.options = options || {
      port:         5001,
      privateToken: process.env.PRIVATE_TOKEN
    }

    this.app = express()
    this.log = debug(this.options.log || 'breezy-pdf-lite:server')
  }

  start() {
    this.log('Starting server...')

    // Add middlware
    this.app.use(Authorization({ privateToken: this.options.privateToken }))
    this.app.use(bodyParser.text({
      type:           '*/*',
      limit:          '50mb',
      parameterLimit: 100000,
      extended:       true
    }))

    this.app.get('/', (req, res) => res.send('OK'))

    this.app.post('/render/html', async (req, res) => {
      this.log('Attempting to render HTML')
      let pdf
      const renderer = new Render(req.body)
      try {
        pdf = await renderer.toPdf()
        res.status(201)
          .set('Content-Disposition', `attachment; filename="${renderer.filename()}"`)
          .send(pdf.toBuffer())
      } catch (error) {
        this.log(error)
        res.status(500).send('Encountered an error while generating PDF. Check the server logs for more details')
      }
    })

    this.app.post('/render/secure', async (req, res) => {
      this.log('Attempting to render secure url')
      let pdf;
      const renderer = new Render(req.body);
      let token = req.get("access-token");
      this.log("token: " + token)
      let uid = req.get("uid")
      this.log("uid: " + uid)
      let client = req.get("client")
      this.log("client: " + client)
      let tokenType = req.get("token-type")
      this.log("tokenType: " + tokenType)
      let expiry = req.get("expiry");
      this.log("expiry: " + expiry)


      try {
        pdf = await renderer.toPdfSecureUrl(token, uid, client, tokenType, expiry)
        res.status(201)
          .set('Content-Disposition', `attachment; filename="${renderer.filename()}"`)
          .send(pdf.toBuffer())
      } catch (error) {
        this.log(error)
        res.status(500).send('Encountered an error while generating PDF. Check the server logs for more details')
      }
    })

    this.app.listen(this.options.port, () => {
      console.log(`Listening for requests at http://localhost:${this.options.port}...`)
    })
  }
}
