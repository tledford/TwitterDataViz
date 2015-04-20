var Twitter 	= require('node-twitter');
var express		= require("express");
var fs 		   	 = require("fs");
var bodyParser   = require("body-parser");
var process      = require('child_process');
var socketio   	 = require("socket.io");

var app = express();
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var server = app.listen(80);
var io = socketio.listen(server);

var counter1 = 0;
var counter2 = 0;

var term1;
var term2;
var streamTerm1;
var streamTerm2;

var twitterStreamClient = new Twitter.StreamClient(
    'Dx7SBf5aQwwhxOlTAoIdUmWuw',
    'glP2WxeeJ72V5bvYPzpzDo2BaK7TWNNzp6LNkHYHoL3NFqNtdc',
    '2530404056-HoK2YKkE9T3Ju6Y5szaesiVj40bBF7Ea7usaL4X',
    'A9U31DHquMo3OxngBJMtGLoKKAaqxL0NsGfhXYgQWGbz7'
    );

//serve up any requested resource file in /205/res
app.get("/res/*", function (req, res) {
    //console.log(__dirname + "  " + req.url);
    try{
      res.end(fs.readFileSync(__dirname + req.url));
  } catch(e) {
      console.log(e);
  }
});

//serve up index.html if /205 is requested
app.get("/205", function (req, res) {
	res.end(fs.readFileSync(__dirname + "/index.html"));
});

//handle the ajax request from the site.
app.get("/startGraphing", function (req, res) {
	term1 = req.query.hashtag1;
	term2 = req.query.hashtag2;
	//console.log("testing");

	streamTerm1 = "#" + term1;
	streamTerm2 = "#" + term2;
	//console.log(streamTerm1);
	//console.log(streamTerm2);
	twitterStreamClient.start([streamTerm1, streamTerm2]);
	res.end("success");
});


twitterStreamClient.on('close', function() {
    console.log('Connection closed.');
});
twitterStreamClient.on('end', function() {
    console.log('End of Line.');
});
twitterStreamClient.on('error', function(error) {
    console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
});
twitterStreamClient.on('tweet', function(tweet) {
    //console.log(tweet);
    term1 = term1.toLowerCase();
    term2 = term2.toLowerCase();
    //console.log(term1 + "  " + term2);

    var hashtags = tweet.entities.hashtags;
    for (var i in hashtags) {
    	//console.log(hashtags[i].text);
    	var hashtag = hashtags[i].text;
    	hashtag = hashtag.toLowerCase();
    	if(hashtag == term1) {
    		counter1 = counter1 + 1;
    		io.emit('term1', counter1);
    	}
    	if(hashtag == term2) {
    		counter2 = counter2 + 1;
    		io.emit('term2', counter2);
    	}
    }

    getLocation(tweet);

    //console.log("Term1: " + counter1);
    //console.log("Term2: " + counter2);
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('stopBtn', function() {
        console.log('stop pressed');
        twitterStreamClient.stop();
        counter1 = 0;
        counter2 = 0;
        io.emit('stopBtnPressed');
    });
});

function getLocation(tweet) {
    // Does the JSON result have coordinates
    if (tweet.coordinates){
        if (tweet.coordinates !== null){
            console.log(tweet.entities.hashtags);
            //If so then build up some nice json and send out to web sockets
            var outputPoint = {"lat": tweet.coordinates.coordinates[0],"lng": tweet.coordinates.coordinates[1]};
            io.emit('tweet-location', outputPoint);
        }
    }
    else if(tweet.place){
        if(tweet.place.bounding_box.type === 'Polygon'){
        // Calculate the center of the bounding box for the tweet
            var coord, _i, _len;
            var centerLat = 0;
            var centerLng = 0;
            coords = tweet.place.bounding_box.coordinates;
            _len = coords[0].length;
            // console.log("Coords: " + coords.length);
            // console.log("Coords[0] (coord): " + coords[0].length);
            // console.log("Coords[0] (coord): " + coords[0]);
            // console.log("Coords[0][0] (coord[0]): " + coords[0][0][0]);
            // console.log("Coords[0][1] (coord[1]): " + coords[0][0][1]);
            // console.log("Coords[0][0] (coord[0]): " + coords[0][2]);
            // console.log("Coords[0][1] (coord[1]): " + coords[0][3]);

            for (_i = 0; _i < _len; _i++) {
                coord = coords[0][_i];
                centerLat += coord[0];
                centerLng += coord[1];
            }
            centerLat = centerLat / _len;
            centerLng = centerLng / _len;

            // Build json object and broadcast it
            var outputPoint = {"lat": centerLat,"lng": centerLng};
            console.log(outputPoint);
            io.emit('tweet-location', outputPoint);
        }
    }
    
}

// var client = new Twitter({
// 	consumer_key: 'Dx7SBf5aQwwhxOlTAoIdUmWuw',
// 	consumer_secret: 'glP2WxeeJ72V5bvYPzpzDo2BaK7TWNNzp6LNkHYHoL3NFqNtdc',
// 	access_token_key: '2530404056-HoK2YKkE9T3Ju6Y5szaesiVj40bBF7Ea7usaL4X',
// 	access_token_secret: 'A9U31DHquMo3OxngBJMtGLoKKAaqxL0NsGfhXYgQWGbz7'
// });