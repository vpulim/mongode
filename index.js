var db = require('./lib/db.js');

function connect(name, serverURIs, options) {
    if (!exports[name]) {
        exports[name] = new db.Database(name, serverURIs, options);
    }
    
    return exports[name];
}

exports.connect = connect;
exports.Database = db.Database;
