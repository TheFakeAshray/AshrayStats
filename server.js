// Made by Ashray Shetty - AKA TheFakeAshray ;)
var express = require('express');
var app = express();
var HTMLParser = require('fast-html-parser');

app.get('/', function(req, res){
    res.sendfile('index.html', { root: __dirname + "/public/index.html" } );
});
//Need this for Steam/LoL Api's
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
var request = require('request');

//Create options and pass that in. Example below
// var options = {
//     url: "thefakeashray.com/api/getDetails",
//     method: 'GET',
//     headers: {'Content-Type' : 'application/json'}
// }
function apiCall(options, callback){
    request(options, function(error, httpResponse, httpBody){
        if (httpResponse.statusCode == '200'){
            console.log("apiCall Success");
            return callback(httpResponse, httpBody);
        }
        else{
            console.log("error:", httpResponse.statusCode);
            return callback(httpResponse, httpBody);
        }
    });
}

app.get('/steam/latestgames', function(httpRequest, httpResponse) {
    // Create the Steam API URL. we want to use process.env.SteamKey
    var options = {
        url:'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key='+process.env.SteamKey+'&steamid=76561198078986044&format=json',
        method: 'GET'
    }
    apiCall(options, function(response, body){
        httpResponse.send(body);
    });
});

app.get('/lol/rank', function(httpRequest, httpResponse) {
    var options = {
        url: "https://oc1.api.riotgames.com/lol/league/v3/positions/by-summoner/1821707?api_key="+process.env.LolKey,
        method: 'GET'
    }
    apiCall(options, function(response, body){
        httpResponse.send(body);
    });
});

app.get('/cinebuzz/getPastBookings', function(httpRequest, httpResponse) {
    console.log("hey");
    // apiCall(httpResponse, url,header)
    var loginOptions = {
        url: "https://www.eventcinemas.co.nz/cinebuzz/login?Username=dabalnce&Password="+process.env.cineBuzz,
        method: 'POST',
    }
    apiCall(loginOptions, function(loginResponse, loginBody){
        var cookie = loginResponse.headers["set-cookie"];
        var bookingsOptions = {
            url: "https://www.eventcinemas.co.nz/cinebuzz/getpastbookings",
            method: 'POST',
            headers: {'Cookie' : cookie}
        } 
        apiCall(bookingsOptions, function(bookingsResponse, bookingsBody){
            //Lets parse this ugly HTML into some Mighty Fine JSON
            var htmlResult = HTMLParser.parse(bookingsBody);
            html = htmlResult.querySelectorAll('.\\"booking\\"');
            var jsonBookings = [];
            var previousJsonEntry;
            for (var x in html){
                var booking = html[x].removeWhitespace().text.replace(/(?:\\[rn])+/g, ",").slice(1,-1);
                var entry = booking.split(",");
                var jsonEntry = {"Title":entry[0], "Date":entry[1], "Time":entry[2].slice(1,9), "Location":entry[2].slice(13,), "Points":entry[3]};
                // Eliminating unwanted results
                // Firstly, duplicates (Where I booked tickets for multiple people)
                if ((jsonEntry.Title != previousJsonEntry) 
                    //If it was at WestCity, it was someone using my card (glitch in their system)
                    && !(jsonEntry.Location.includes("Westcity"))
                    //If location is empty (date is headoffice), it was because I was granted points, because of someone using my card.
                    && !(jsonEntry.Location == ""))
                {
                    previousJsonEntry = jsonEntry.Title;
                    jsonBookings.push(jsonEntry);
                }
                
                
            }
            // console.log(jsonBookings);
            httpResponse.send(jsonBookings);
        });
    });
});


app.use('/', express.static('public'));

var port = process.env.port || 1337;
app.listen(port);




