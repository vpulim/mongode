var Cursor = function(command, args) {
    this.command = command;
    this.args = args;
    this._cursor = null;
    this._waiting = [];
    this._hasCallback = false;
};

Cursor.prototype._connected = function(cursor) {
    var self = this;

    self._cursor = cursor;
    self._isConnected = true;

    self._waiting.forEach(function(op) {
        var fn = self._cursor[op.command];
        fn.apply(self._cursor, op.args);
    });
    self._waiting = [];
};

Cursor.functions = [
    'rewind',
    'toArray',
    'each',
    'count',
    'sort',
    'limit',
    'skip',
    'batchSize',
    'nextObject',
    'getMore',
    'explain',
    'close'
];

Cursor.functions.forEach(function(name) {
    Cursor.prototype[name] = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments);

        self._waiting.push({
            command: name,
            args: args
        });

        if (self._isConnected) {
            process.nextTick(function() {
                self._connected(self._cursor);
            });
        }

        return self;
    };
});

exports.Cursor = Cursor;