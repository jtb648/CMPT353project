/**
 * Joel Berryere jtb648 11205074
 */

 'use strict';


// load package
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://Joel:admin@projectcluster.5fg7z.mongodb.net/<dbname>?retryWrites=true&w=majority";

const PORT = 8080;
const HOST = '0.0.0.0';

app.get('/connect', (req,res)=>{
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        console.log("Database created!");
        db.close();
      });
});
                    //Customer

//Creates a "orders" document in a mongodb cluster in a collection "project" if one hasn't been made        
app.get('/createorders', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        dbo.createCollection("orders",function(err,res){
            if (err) throw err;
            console.log("Orders created");
            db.close();
        });
    });
    res.send("orders Created");
});

//Delete this probably
app.get('/createcomplete', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        dbo.createCollection("complete_orders",function(err,res){
            if (err) throw err;
            console.log("Complete orders created");
            db.close();
        });
    });
    res.send("complete_orders Created");
});

//Inserts an order, made by a customer, into the collection project's "orders" document
app.post('/insertorder', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var name = req.body.name;
        var card = req.body.card;
        var items = req.body.items;
        var timestamp = new Date(Date.now());
        var myorder = {name: name, card: card, items: items, timestamp: timestamp, ready: "No"};
        dbo.collection("orders").insertOne(myorder, function(err,result){
            if (err) throw err;
            console.log("order inserted");
            res.redirect('/createorder.html');
            db.close();
        });
    });
});

//Deletes an order, made by a customer, from the collection project's "orders" document
app.post('/cancelorder', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var card = req.body.card;
        var deleteorder = {card: card};
        dbo.collection("orders").deleteOne(deleteorder, function(err,result){
            if (err) throw err;
            console.log("order deleted");
            res.redirect('/createorder.html');
            db.close();
        });
    });
});
                        //Employee

//Updates an order's "ready" variable to "Yes" in the collection project's "orders" document
app.post('/readyorder', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var card = req.body.card;
        var toupdate = {ready:"No"};
        var updated = {$set:{ready: "Yes"}};
        dbo.collection("orders").updateOne(toupdate, updated, function(err,result){
            if (err) throw err;
            console.log("ready ok");
            res.redirect('/seeorders.html');
            db.close();
        });
    });
});

//Creates a "menu" document in a mongodb cluster in a collection "project" if one hasn't been made
app.get('/createmenu', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        dbo.createCollection("menu",function(err,result){
            if (err) throw err;
            console.log("Menu created");
            res.redirect('/menu.html');
            db.close();
        });
    });
});

//Inserts an item and price into the collection "project"'s "menu" document
app.post('/insertmenu', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var item = req.body.item;
        var price = req.body.price;
        var mymenu = {Item: item, Price: price};
        dbo.collection("menu").insertOne(mymenu, function(err,result){
            if (err) throw err;
            console.log("menu inserted");
            res.redirect('/menu.html');
            db.close();
        });
    });
});

//Updates an item or price or both in "menu" in the collection "project"'s "menu" document
app.post('/modifymenu', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var modified_item = req.body.modified_item; //Item or Price
        var update_item = req.body.update_item; //update item value
        var update_price = req.body.update_price; // update price value
        var toupdate = {Item: modified_item}; //Item with the name modifed_value
        var updated = {$set: {Item: update_item, Price: update_price}}; // Item with name modified_value changed to update_item/price 
        dbo.collection("menu").updateOne(toupdate, updated, function(err,result){
            if (err) throw err;
            console.log("modify ok");
            res.redirect('/menu.html');
            db.close();
        });
    });
});

//Deletes an item and price from the collection "project"'s "menu" document
app.post('/deleteitem', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var Item = req.body.Item;
        var deleteitem = {Item: Item};
        dbo.collection("menu").deleteOne(deleteitem, function(err,result){
            if (err) throw err;
            console.log("item deleted");
            res.redirect('/menu.html');
            db.close();
        });
    });
});

//this doesnt work yet/// doesnt need to work since ready are now display on own in checkready.html ///delete this probably
app.post('/completeorder', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var ready = "Yes";
        dbo.collection("orders").aggregate([{$match: {ready: ready}},{$out: dbo.collection("complete_orders")}], function(err,res){
            if (err) throw err;
            console.log("complete ok");
            //res.redirect('/seeorders.html');
            db.close();
        });
        res.send("ok");
    });
});

//Deletes an order, made by a customer,from the collection project's "orders" document once it has been completed and picked up
app.post('/deleteorder', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        var Item = req.body.Item;
        var deleteitem = {ready: "Yes"};
        dbo.collection("orders").deleteOne(deleteitem, function(err,result){
            if (err) throw err;
            console.log("order deleted");
            res.redirect('/seeorders.html');
            db.close();
        });
    });
});

//Finds the current menu items in the collection "project"'s "menu" document 
app.get('/selectmenu', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        dbo.collection("menu").find({}, {projection: {_id:0, Item:1, Price:1}}).toArray(function(err,result){
            if (err) throw err;
            console.log("selected menu");
            res.send(result);
            //res.redirect('/menu.html');
            db.close();
        });
    });
});

//Finds the current orders in the collection "project"'s "orders" document that have a "No" as the "ready" variable value
app.get('/selectorders', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        dbo.collection("orders").find({ready:"No"}, {projection: {_id:0, name:1, card:1,items:1,timestamp:1, ready:1}}).toArray(function(err,result){
            if (err) throw err;
            console.log("selected orders");
            res.send(result);
            //res.redirect('/menu.html');
            db.close();
        });
    });
});

//Finds the current orders in the collection "project"'s "orders" document that have a "Yes" as the "ready" variable value
app.get('/selectready', (req,res)=>{
    MongoClient.connect(uri, function(err, db){
        var dbo = db.db("project");
        dbo.collection("orders").find({ready:"Yes"}).toArray(function(err,result){
            if (err) throw err;
            console.log("selected ready from orders");
            res.send(result);
            //res.redirect('/menu.html');
            db.close();
        });
    });
});

app.use('/', express.static('pages'));
console.log('up and running');


app.listen(PORT,HOST); 