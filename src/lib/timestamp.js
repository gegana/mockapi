/**
 * Returns a timestamp of the system clock
 */
module.exports = function timestamp() {
    const moment = require('moment')
    return moment.utc().format("HH:mm:ss.SSS");
}