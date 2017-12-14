const version = require('../../package.json').version

module.exports = {
  method: 'GET',
  path: '/',
  handler: function (req, res, next) {
    res.render('index', {
      title: 'Supermockapi v' + version
    })
  }
}