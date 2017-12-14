module.exports = [{
        method: 'POST',
        path: '/mockapi/route',
        handler: function (req, res, next, routeRepository) {
            var route = req.body
            try {
                routeRepository.addRoute(route)
                res.status(200).send({
                    message: "Document created successfully."
                })
            }
            catch (err) {
                next(err)
            }
        }
    },
    {
        method: 'GET',
        path: '/mockapi/route/:id',
        handler: function (req, res, next, routeRepository) {
            var id = req.params.id
            try {
                var r = routeRepository.getRoute(id)
                res.status(200).send(r)
            }
            catch (err) {
                next(err)
            }
        }
    },
    {
        method: 'GET',
        path: '/mockapi/route',
        handler: function (req, res, next, routeRepository) {
            try {
                var r = routeRepository.getAllRoutes()
                res.status(200).send(r)
            }
            catch (err) {
                next(err)
            }
        }
    },
    {
        method: 'DELETE',
        path: '/mockapi/route/:id',
        handler: function (req, res, next, routeRepository) {
            var id = req.params.id
            try {
                routeRepository.removeRoute(id)
                res.status(200).send("Document removed successfully.")
            }
            catch (err) {
                next(err)
            }
        }
    }
]