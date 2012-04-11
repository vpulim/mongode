var db = require('./lib/db.js');

var nameCache = {};

function connect(name, serverURIs, options) {
    if (!nameCache[name]) {
        var newDb = new db.Database(name, serverURIs, options);
        exports[newDb.name] = nameCache[name] = newDb;
    }

    return nameCache[name];
}

exports.connect = connect;
exports.Database = db.Database;
exports.ObjectID = db.ObjectID;
exports.BSON = db.BSON;