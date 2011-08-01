var mongodb = require('mongodb'),
    url = require('url'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Collection = require('./collection').Collection;

var Database = function(name, serverURIs, options) {
    EventEmitter.call(this);
    
    var self = this,
        servers = [], 
        serverConfig;

    options = options || {};

    self._waiting = [];
    self._isConnected = false;
    
    if (Array.isArray(serverURIs)) {
        serverURIs.forEach(function(uri) {
            servers.push(Database._serverFromUri(uri, options));            
        })
        serverConfig = new mongodb.ReplSetServers(servers, options);
    }
    else {
        serverConfig = Database._serverFromUri(serverURIs, options);
    }

    self._db = new mongodb.Db(name, serverConfig, { native_parser:true })

    self._db.open(function(err) {
        if (err) {
            self.emit('error', err);
        }
        else {
            self._connected();
        }
    })
}
util.inherits(Database, EventEmitter);

Database.prototype.collection = function(name) {
    if (this[name]) {
        return this[name];
    }

    var self = this,
        collection = new Collection(name);
    
    self._waiting.push(collection);

    if (self._isConnected) {
        process.nextTick(function() {
            self._connected();            
        })
    }
    
    this[name] = collection;
    
    return collection;
}

Database.prototype._connected = function() {
    var self = this,
        db = self._db;

    self._isConnected = true;
    
    self._waiting.forEach(function(collection) {
        db.collection(collection.name, function(err, c) {
            if (err) {
                self.emit('error', err);
            }
            else {
                collection._connected(c);                
            }
        });
    });
    self._waiting = [];
}

Database._serverFromUri = function(uri, options) {
    uri = url.parse(uri);
    if (uri.protocol !== 'mongodb:') 
        throw new Error('database URI must start with mongodb://')
    return new mongodb.Server(uri.hostname, +(uri.port || 27017), options)
}

exports.Database = Database;