const ObjectId = require('mongodb').ObjectID

module.exports = [{
        method: 'POST',
        path: '/mockapi/route',
        handler: function (req, res, next, mongodb) {
            var collection = mongodb.collection('routes')
            var route = req.body
            route.timestamp = Date.now()
            collection.insertOne(route, function (err, r) {
                if (err) {
                    next(err)
                } else {
                    res.status(200).send({
                        message: "Document created successfully."
                    })
                }
            })
        }
    },
    {
        method: 'GET',
        path: '/mockapi/route/:id',
        handler: function (req, res, next, mongodb) {
            var collection = mongodb.collection('routes')
            var id = req.params.id
            collection.findOne({
                '_id': new ObjectId(id)
            }, function (err, r) {
                if (err) {
                    next(err)
                } else {
                    res.status(200).send(r)
                }
            })
        }
    },
    {
        method: 'GET',
        path: '/mockapi/route',
        handler: function (req, res, next, mongodb) {
            var collection = mongodb.collection('routes')
            collection.find({}).sort({
                timestamp: -1
            }).toArray(function (err, r) {
                if (err) {
                    next(err)
                } else {
                    res.status(200).send(r)
                }
            })
        }
    },
    {
        method: 'DELETE',
        path: '/mockapi/route/:id',
        handler: function (req, res, next, mongodb) {
            var collection = mongodb.collection('routes')
            var id = req.params.id
            collection.remove({
                '_id': new ObjectId(id)
            }, function (err, r) {
                if (err) {
                    next(err)
                } else {
                    res.status(200).send(r)
                }
            })
        }
    }
]