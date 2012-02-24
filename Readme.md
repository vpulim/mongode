Introduction
============

Mongode is a very thin (~200 lines of code) wrapper around the [node-mongodb-native](https://github.com/christkv/node-mongodb-native) driver. It buffers collection operations until a connection is made, thus removing one level of callback nesting.  It also binds collections to the database object as a key on the object making code easier to read. See below for examples of how to insert a document using mongode and how to bind collections.

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
    var test = mongode.connect('mongo://127.0.0.1/test');
    var collection = test.collection('test_collection');
    collection.insert({hello: 'world'}, {safe:true}, function(err, objects) {
      if (err) console.warn(err.message);
    });

Binding
-------

You can bind databases and collections by name:

    var mongode = require('mongode');
    mongode.connect('mongo://127.0.0.1/test');

    var test = mongode.test;
    test.collection('foo');
    test.collection('bar');
    
    test.foo.find().each(function(err, object) {});
    test.bar.find().each(function(err, object) {});
