var mongodb = require('mongodb'),
    url = require('url'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    Collection = require('./collection').Collection;

var Database = function(name, servers, options) {
    EventEmitter.call(this);
    
    var self = this,
        serverConfig;

    options = options || {};

    self._waiting = [];
    self._isConnected = false;
    
    if (Array.isArray(servers)) {
    	servers = servers.map(function(server) {
           return Database._newServer(server, options);
        });
        serverConfig = new mongodb.ReplSetServers(servers, options);
    }
    else {
        serverConfig = Database._newServer(servers, options);
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
    var obj = this;
    var parts = name.split('.');
    if (parts.length > 1) {
        parts.forEach(function(part, i) {
            if (i == parts.length - 1) {
                obj[part] = collection;            
            }
            else {
                obj = obj[part] = {};
            }
        })        
    }

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

Database._newServer = function(server, options) {
    var parts = server.split(':'),
        host = parts[0],
        port = parseInt(parts[1] || 27017, 10);

    return new mongodb.Server(host, port, options)
}

exports.Database = Database;