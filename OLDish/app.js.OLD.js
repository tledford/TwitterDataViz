var Twitter 	= require('twitter');
var express		= require("express");
var fs 		   	 = require("fs");
var bodyParser   = require("body-parser");
var process      = require('child_process');

var app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


var client = new Twitter({
	consumer_key: 'Dx7SBf5aQwwhxOlTAoIdUmWuw',
	consumer_secret: 'glP2WxeeJ72V5bvYPzpzDo2BaK7TWNNzp6LNkHYHoL3NFqNtdc',
	access_token_key: '2530404056-HoK2YKkE9T3Ju6Y5szaesiVj40bBF7Ea7usaL4X',
	access_token_secret: 'A9U31DHquMo3OxngBJMtGLoKKAaqxL0NsGfhXYgQWGbz7'
});

app.get("/files/*", function (req, res) {
	try{
		res.end(fs.readFileSync(__dirname + req.url));
	} catch(e) {
		console.log(e);
	}
});

app.get("/205", function (req, res) {
	res.end(fs.readFileSync(__dirname + "/index.html"));
});

// app.get("/functions.js", function (req, res) {
// 		res.end(fs.readFileSync(__dirname + "/functions.js"));
// });

app.get("/startGraphing", function (req, res) {
	console.log(req.query);
	var term1 = "%23" + req.query.hashtag1;
	var term2 = "%23" + req.query.hashtag2;

	client.stream('statuses/filter', {track: term1}, function(stream) {
		stream.on('data', function(tweet) {
			console.log(response);
		});

		stream.on('error', function(error) {
			console.log(error);
			throw error;

		});
	});

	// client.stream('statuses/filter', {track: term2}, function(stream) {
	// 	stream.on('data', function(tweet) {
	// 		console.log(tweet.entities.hashtags);
	// 	});

	// 	stream.on('error', function(error) {
	// 		console.log(error);
	// 		throw error;
	// 	});
	// });
	//res.end("1");
});

var server = app.listen(80);
