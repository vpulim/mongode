var Cursor = require('./cursor').Cursor;

var Collection = function(name, options, connectCallback) {
    if (typeof options === 'function') {
        connectCallback = options;
        options = null;
    }
    this._name = name;
    this._options = options || {};
    this._collection = null;
    this._isConnected = false;
    this._callback = connectCallback || function () {};
    this._waiting = [];
};

Collection.prototype.getName = function() {
    return this._name;
};

Collection.prototype.getOptions = function() {
    return this._options;
};

Collection.prototype.getCallback = function() {
    return this._callback;
};

Collection.prototype._connected = function(collection) {
    var self = this;

    self._collection = collection;
    self._isConnected = true;
    for (var i=0, cursor; cursor=self._waiting[i]; i++) {
        self._execute(cursor);
    }
    self._waiting = [];
};

Collection.prototype._execute = function(cursor) {
    var collection = this._collection;

    if (!collection) return;
    var fn = collection[cursor.command],
        c = fn.apply(collection, cursor.args);
    cursor._connected(c);
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
    'find',
    'findAndModify',
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

Collection.cursorFunctions = [
    'find'
];

Collection.functions.forEach(function(name) {
    Collection.prototype[name] = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments),
            isCursorOp = ~Collection.cursorFunctions.indexOf(name),
            cursor = new Cursor(name, args);

        if (self._isConnected) {
            if (isCursorOp) {
                process.nextTick(function() {
                    self._execute(cursor);
                });
            }
            else {
                self._execute(cursor);
            }
        }
        else {
            self._waiting.push(cursor);            
        }

        return isCursorOp ? cursor : null;
    };
});

exports.Collection = Collection;