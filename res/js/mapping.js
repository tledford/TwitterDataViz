//Globals
var liveTweets;
var socket = io();
var map;
var term1Heatmap;
var term2Heatmap;


$(document).ready(function() {
	$('#legend').hide();
	$('#stopBtn').click(function(e) {
		socket.emit("stopBtn");
	});

	$("#pizzaPie").pie();
});

socket.on('term1', function(msg){
	$('#term1total').html(msg);
	$("#term1pie").attr("data-val", msg);
});

socket.on('term2', function(msg){
	$('#term2total').html(msg);
	$("#term2pie").attr("data-val", msg);
});

socket.on('text', function(text){
	$('#tweetText').prepend("<br /><br />");
	$('#tweetText').prepend("&rarr;  " + text);
});


// This listens on the "twitter-steam" channel and data is 
// received everytime a new tweet is receieved.
socket.on('term1-location', function (mapPoint) {
	//Add tweet to the heat map array.
	var tweetLocation = new google.maps.LatLng(mapPoint.lng,mapPoint.lat);
	term1LiveTweets.push(tweetLocation);

	//Flash a dot onto the map quickly
	var image = "/res/css/small-dot-icon.png";
	var marker = new google.maps.Marker({
		position: tweetLocation,
		map: map,
		icon: image
	});
	setTimeout(function(){
		marker.setMap(null);
	},600);
});

socket.on('term2-location', function (mapPoint) {
	//Add tweet to the heat map array.
	var tweetLocation = new google.maps.LatLng(mapPoint.lng,mapPoint.lat);
	term2LiveTweets.push(tweetLocation);

	//Flash a dot onto the map quickly
	var image = "/res/css/small-dot-icon.png";
	var marker = new google.maps.Marker({
		position: tweetLocation,
		map: map,
		icon: image
	});
	setTimeout(function(){
		marker.setMap(null);
	},600);
});

function beginGraphing() {
	$('#legend').show();
	$('#term1name').html("#" + $("#hashtag1").val());
	$('#term2name').html("#" + $("#hashtag2").val());
	$('#term1total').html("0");
	$('#term2total').html("0");
	$("#term1pie").attr("data-val", "0");
	$("#term2pie").attr("data-val", "0");

	wipeMap();

	$.ajax({
		url: "/startGraphing",
		method: "GET",
		async: true,
		cache: false,
		data: {
			hashtag1: $("#hashtag1").val(),
			hashtag2: $("#hashtag2").val()
		},
		success: function(data) {
			console.log(data);
		}
	});
}

function initialize() {
	//Setup Google Map
	var myLatlng = new google.maps.LatLng(17.7850,-12.4183);
	var light_grey_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];
	var myOptions = {
		zoom: 2,
		center: myLatlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.LEFT_BOTTOM
		},
		styles: light_grey_style
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	//Setup heat map and link to Twitter array we will append data to
	
	term1LiveTweets = new google.maps.MVCArray();
	term1Heatmap = new google.maps.visualization.HeatmapLayer({
		data: term1LiveTweets,
		radius: 25
	});
	term1Heatmap.setMap(map);
	setTerm1Gradient();

	term2LiveTweets = new google.maps.MVCArray();
	term2Heatmap = new google.maps.visualization.HeatmapLayer({
		data: term2LiveTweets,
		radius: 25
	});
	term2Heatmap.setMap(map);
	setTerm2Gradient();
}
function setTerm1Gradient() {
    gradient = [
        'rgba(0, 0, 0, 0)',
        'rgba(101, 192, 252, 1)',
        'rgba(84, 160, 211, 1)',
        'rgba(74, 141, 186, 1)',
        'rgba(62, 119, 158, 1)'
    ];
    term1Heatmap.set('gradient', gradient);
}

function setTerm2Gradient() {
    gradient = [
        'rgba(0, 0, 0, 0)',
        'rgba(224, 255, 0, 1)',
        'rgba(200, 227, 0, 1)',
        'rgba(179, 204, 0, 1)',
        'rgba(179, 237, 5, 1)'
    ];
    term2Heatmap.set('gradient', gradient);
}

function wipeMap() {
	term1LiveTweets.clear();
	term2LiveTweets.clear();
}