Introduction
============

Mongode is a very thin (~200 lines of code) wrapper around the [node-mongodb-native](https://github.com/christkv/node-mongodb-native) driver. It's main purpose is to reduce the amount of function call nesting that is usually needed with the native driver. It does this by buffering commands until the appropriate objects are available.

Installation
============

npm install mongode

Examples
========

Insert 
------

node-mongodb-native:

    var mongodb = require('mongodb');
    var server = new mongodb.Server("127.0.0.1", 27017, {});
    new mongodb.Db('test', server, {}).open(function (error, client) {
      if (error) throw error;
      var collection = new mongodb.Collection(client, 'test_collection');
      collection.insert({hello: 'world'}, {safe:true}, function(err, objects) {
        if (err) console.warn(err.message);
      });
    });    
    
mongode:

    var mongode = require('mongode');
    var db = new mongode.Database('test', 'mongodb://127.0.0.1');
    var collection = db.collection('test_collection');
    collection.insert({hello: 'world'}, {safe:true}, function(err, objects) {
      if (err) console.warn(err.message);
    });

