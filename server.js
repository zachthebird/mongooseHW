var express = require('express');

var exphbs = require('express-handlebars');

var mongoose = require('mongoose');

var bodyParser = require('body-parser');

var cheerio = require('cheerio');

var request = require('request');

var News = require('./newsModel.js');

var app = express();

var PORT = 4321;

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json 
app.use(bodyParser.json())

app.use(express.static("public"));

mongoose.connect('mongodb://localhost/newsScraper');

var db = mongoose.createConnection('mongodb://localhost/newsScraper');

db.on('error', function(error){
    console.log("Mongoose error: " + error);
})

db.once('open', function(){
    console.log("Mongoose connection successful");
})

app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/scrape', function (req, res) {
    request('http://www.businessinsider.com', function (error, response, html) {

        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);

        // An empty array to save the data that we'll scrape
        var result = [];

        // Select each instance of the HTML body that you want to scrape
        // NOTE: Cheerio selectors function similarly to jQuery's selectors, 
        // but be sure to visit the package's npm page to see how it works
        $('h2.overridable').each(function (i, element) {

            var link = $(element).children().attr("href");
            var title = $(element).children().text();

            // Save these results in an object that we'll push into the result array we defined earlier
            result.push({
                title: title,
                link: link
            });
        });
        console.log(result);
        res.send(result);
    });
});

app.post('/save', function(req, res){
    console.log('request: ', req.body);
    var news = new News(req.body);
    News.findOneAndUpdate(req.body, news, {upsert: true, new: true}, function(error, doc){
        if(error){
            res.send(error);
        } else {
            res.send(doc);
        }
    })
    console.log('response: ', res);
})

app.post('/remove', function(req, res){
    console.log('req.body: '+req);
    News.deleteOne(req.body).then(function(err, doc){
        if(err){
            throw err;
        }else{
            res.render('saved', {news: doc});
        }
    })
})

app.post('/postcomment', function(req, res){
    console.log('title: (req.body.title)', req.body.title);
    var news = new News(req.body);
    News.findOneAndUpdate({title: req.body.title}, {$set: {comment: req.body.comment}}, {upsert: true, new: true, runSettersOnQuery: true}, function(error, doc){
        if(error){
            res.send(error);
        } else {
            console.log(doc);
            res.send(doc);
        }
    })
    console.log('response: ', res);
});

app.get('/saved', function(req, res){
    News.find({}, function(err, doc){
        if(err){
            throw err;
        }else{
            // res.send(doc);
            res.render('saved', {news: doc});
        }
    });
})

app.listen(PORT, function () {
    console.log('app listening on PORT ' + PORT);
});