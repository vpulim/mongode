var Cursor = require('./cursor').Cursor;

var Collection = function(name) {
    this.name = name;
    this._collection = null;
    this._isConnected = false;
    this._waiting = [];
}

Collection.prototype._connected = function(collection) {
    var self = this;

    self._collection = collection;
    self._isConnected = true;
    self._waiting.forEach(function(cursor) {
        var fn = collection[cursor.command],
            c = fn.apply(collection, cursor.args);
        cursor._connected(c);
    })
    self._waiting = [];
}

Collection.functions = [
    'insert',
    'remove',
    'rename',
    'insertAll',
    'save',
    'update',
    'distinct',
    'count',
    'drop',
    'findAndModify',
    'find',
    'findOne',
    'createIndex',
    'ensureIndex',
    'indexInformation',
    'dropIndex',
    'dropIndexes',
    'mapReduce',
    'group',
    'options'
];

Collection.functions.forEach(function(name) {
    Collection.prototype[name] = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments),
            cursor = new Cursor(name, args);

        self._waiting.push(cursor);

        if (self._isConnected) {
            process.nextTick(function() {
                self._connected(self._collection);            
            })
        }

        return cursor;
    }    
})

exports.Collection = Collection;