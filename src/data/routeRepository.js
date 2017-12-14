const Loki = require('lokijs'),
    Guid = require('guid')

module.exports = class RouteRepository {
    constructor() {
        const db = new Loki('supermockapi.db')
        this.routes = db.addCollection('routes')
    }

    /**
     * Find a route by its unique id
     * @param {string} id 
     */
    getRoute(id) {
        return this.routes.findOne({_id: id})
    }

    getAllRoutes() {
        return this.routes.find({}).sort(timestampDesc)
    }

    /**
     * Return an array of routes for a particular http verb
     * @param {string} httpVerb - GET, POST, PUT, DELETE
     */
    getRoutes(httpVerb) {
        return this.routes.find({method: httpVerb})
                          .sort(timestampDesc)
    }

    /**
     * Add a new route object to the collection
     * @param {object} route 
     */
    addRoute(route) {
        route._id = Guid.create().toString()
        route.timestamp = Date.now()
        this.routes.insert(route)
    }

    /**
     * Add new route objects to the collection
     * @param {[object]} routes 
     */
    addRoutes(routes) {
        for (var i in routes) {
            var route = routes[i]
            this.addRoute(route)
        }
    }

    /**
     * Remove a route by its unique id
     * @param {string} id 
     */
    removeRoute(id) {
        this.routes.findAndRemove({_id: id})
    }
}

function timestampDesc(a, b) {
    if (a.timestamp > b.timestamp) {
        return -1
    }
    else if (a.timestamp < b.timestamp) {
        return 1
    }
    return 0
}
