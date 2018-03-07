// Made by The Fake Ashray ;)
var express = require('express');
var app = express();

app.get('/', function(req, res){
    res.sendfile('index.html', { root: __dirname + "/public/index.html" } );
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var request = require('request');

app.get('/steam/latestgames', function(httpRequest, httpResponse) {
    // Calculate the Steam API URL we want to use
    var url = 'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key='+process.env.SteamKey+'&steamid=76561198078986044&format=json';
    request.get(url, function(error, steamHttpResponse, steamHttpBody) {
        // Once we get the body of the steamHttpResponse, send it to our client
        // as our own httpResponse
        httpResponse.setHeader('Content-Type', 'application/json');
        httpResponse.send(steamHttpBody);
    });
});

app.get('/lol/rank', function(httpRequest, httpResponse) {
    var url = "https://oc1.api.riotgames.com/lol/league/v3/positions/by-summoner/1821707?api_key="+process.env.LolKey;
    request.get(url, function(error, lolHttpRequest, lolHttpBody){
        // httpResponse.setHeader('Content-Type', 'application/json');
        httpResponse.send(lolHttpBody);
    });
});

app.use('/', express.static('public'));

//var port = 4000;
// var port = process.env.port || 1337;
// var server = app.listen(port);
// console.log('Listening on port ' + port);
var port = process.env.port || 1337;
app.listen(port);


