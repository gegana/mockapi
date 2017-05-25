"use strict"

const Timestamp = require('./lib/timestamp'),
  RouteFactory = require('./routeFactory'),
  RouteHandler = require('./services/routeHandler'),
  Hyperwatch = require('hyperwatch'),
  Session = require('express-session')

/**
 * Bootstrap express js application
 */
module.exports = class Startup {

  /**
   * Default HTTP routes
   */
  get routes() {
    return {
      'index': require('./routes/index'),
      'api': require('./routes/api'),
      'gateway': require('./routes/gateway')
    }
  }

  /**
   * Default empty constructor
   */
  constructor() {
    this.__routeFactory = new RouteFactory()
    this.__config = require('../config.json')
  }

  /**
   * Configure service dependencies
   * @param {object} services 
   */
  useServices(services) {
    for (let key in services) {
      this.__routeFactory.useService(key, services[key])
    }
    return this
  }

  /**
   * Boot an express js application
   * @param {object} routes 
   * @param {string} port 
   * @param {bool} stateless - Stateless mode means no UI, API, and persistence storage
   */
  async boot(routes, port, stateless) {
    console.log('[' + Timestamp() + '] Booting ' + ((stateless) ? 'stateless' : 'stateful') +  ' application')
    await this.initApp(routes, stateless)
    this.start(port)
  }

  /**
   * Construct an express js app with minimal configuration
   * @param {object} routes
   * @param {bool} stateless - Stateless mode means no UI, API, and persistence storage 
   */
  async initApp(routes, stateless) {
    console.log('[' + Timestamp() + '] Initializing express js application')
    this.app = require('express')()
    this.setView('twig')
      .setParsers()
      .setLogger()
      .useSession()
    if (!stateless) {
      await this.useMongoDb()
      this.useNodeCache()
    }
    this.setRoutes(routes, stateless)
    return this
  }

  /**
   * Start express js app running on specified port
   * @param {string} port 
   */
  start(port) {
    var port = port || '3000'
    console.log('[' + Timestamp() + '] Starting server on port ' + port)
    this.app.set('port', port)
    this.server = require('http').createServer(this.app)
    this.server.listen(port)
    this.server.on('error', this.__onError)
    this.server.on('listening', this.__onListening)
    Hyperwatch(this.server)
  }

  /**
   * Event listener for server errors
   * @param {object} err 
   */
  __onError(err) {
    if (error.syscall !== 'listen') {
      throw error
    }

    var bind = typeof port === 'string' ?
      'Pipe ' + port :
      'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
      default:
        throw error
    }
  }

  /**
   * Event listener for when server starts listening to HTTP port
   */
  __onListening() {
    const debug = require('debug')('mockapi:server')
    var addr = this.address()
    var bind = typeof addr === 'string' ?
      'pipe ' + addr :
      'port ' + addr.port
    debug('Listening on ' + bind)
  }

  /**
   * Setup express js app to use a particular view engine
   * @param {string} viewEngine 
   */
  setView(viewEngine) {
    // view engine setup
    console.log('[' + Timestamp() + '] Setting express js view engine')
    this.app.set('views', require('path').join(__dirname, 'views'))
    this.app.set('view engine', viewEngine)
    return this
  }

  /**
   * Setup express js app to use morgan logger
   */
  setLogger() {
    console.log('[' + Timestamp() + '] Setting express js logger')
    const morgan = require('morgan')
    this.app.use(morgan('dev'))
    return this
  }

  /**
   * Setup express js cookie and json parser
   */
  setParsers() {
    console.log('[' + Timestamp() + '] Setting express js HTTP header and content parsers')
    const cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser')

    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({
      extended: false
    }))
    this.app.use(cookieParser())

    return this
  }

  /**
   * Setup express js to use session - can be accessed from req.session
   */
  useSession() {
    this.app.use(Session({
      secret: 'moistened weasels',
      resave: false,
      saveUninitialized: true
    }))
    return this
  }

  /**
   * Setup mongodb repository
   */
  async useMongoDb() {
    console.log('[' + Timestamp() + '] Setting express js to use mongo db')
    const client = require('mongodb').MongoClient,
      connectionString = process.env.MONGODB_CONNECTION_STRING || this.__config.mongodb.connectionString

    var db = await client.connect(connectionString)
    console.log('[' + Timestamp() + '] Successfully connected to mongo db at ' + connectionString)
    this.__routeFactory.tryUseService('mongodb', db)

    return this
  }

  /**
   * Setup memory cache using node-cache
   */
  useNodeCache() {
    const NodeCache = require('node-cache'),
      memCache = new NodeCache({
        stdTTL: this.__config.nodecache.ttl || 60 // seconds
      })
    this.__routeFactory.tryUseService('memorycache', memCache)

    return this
  }

  /**
   * Setup express js app HTTP routes
   * @param {object} routes 
   * @param {bool} stateless - Stateless mode means no UI, API, and persistence storage 
   */
  setRoutes(routes, stateless) {
    console.log('[' + Timestamp() + '] Setting express js routes')
    const globalErrorHandler = require('./middlewares/globalErrorHandler'),
      pageNotFoundHandler = require('./middlewares/pageNotFoundHandler')

    if (!stateless) {
      // Handle static file requests to public folder
      this.app.use(
        require('express')
        .static(require('path')
          .join(__dirname, 'public')
        )
      )

      // Setup app to use defined routes
      for (let key in this.routes) {
        let route = this.routes[key]
        if (Array.isArray(route)) {
          for (let key in route) {
            var r = route[key]
            this.__routeFactory.register(r.method, r.path, r.handler)
          }
        } else {
          this.__routeFactory.register(route.method, route.path, route.handler)
        }
      }
    }

    // Setup injected routes
    var routes = routes || {}
    for (let key in routes) {
      let route = routes[key]
      this.__routeFactory.register(route.method, route.path, function (req, res, next) {
        const h = new RouteHandler(route)
        h.processRequest(req, res, next).then().catch((err) => {
          next(err)
        })
      })
    }

    this.app.use(this.__routeFactory.router)

    // Default to 404 when route not found
    this.app.use(pageNotFoundHandler)

    // Handle errors globally
    this.app.use(globalErrorHandler)

    return this
  }
}