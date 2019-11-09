// Made by Ashray Shetty - AKA TheFakeAshray ;)
const express = require('express');
const app = express();
const HTMLParser = require('fast-html-parser');
const request = require('request');
const cron = require('node-cron');
require('dotenv').config();

cron.schedule('* * * * *', () => console.log('cron run every minute'));

app.get('/', (req, res) => res.sendfile('index.html', { root: __dirname + '/public' }));

//Need this for Steam/LoL Api's
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

apiCall = (options, callback) => {
	request(options, (error, httpResponse, httpBody) => {
		httpResponse.statusCode == '200'
			? console.log('apiCall Success')
			: console.log(`error: ${httpResponse.statusCode}`);
		return callback(httpResponse, httpBody);
	});
};

app.get('/steam/latestgames', (httpRequest, httpResponse) => {
	// Create the Steam API URL. we want to use process.env.SteamKey
	const options = {
		url: `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.SteamKey}&steamid=76561198078986044&format=json`,
		method: 'GET'
	};
	apiCall(options, (response, body) => httpResponse.send(body));
});

app.get('/lol/rank', (httpRequest, httpResponse) => {
	const summonerOptions = {
		url: `https://oc1.api.riotgames.com/lol/summoner/v4/summoners/by-name/balnce?api_key=${process.env.LolKey}`,
		method: 'GET'
	};
	apiCall(summonerOptions, (response, body) => {
		const { id } = JSON.parse(body);
		const options = {
			url: `https://oc1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${process.env.LolKey}`,
			method: 'GET'
		};
		apiCall(options, (response, body) => httpResponse.send(body));
	});
});

app.get('/cinebuzz/getPastBookings', (httpRequest, httpResponse) => {
	const MongoClient = require("mongodb").MongoClient;
  const uri = `mongodb+srv://${process.env.mongoUser}:${process.env.mongoPass}@ashrayscluster-kzzor.azure.mongodb.net`;
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    if (err) console.log(err);
    else {
      client
        .db("Stats")
        .collection("watchedMovies")
        .find({ watched: true })
        .toArray()
        .then(result => httpResponse.send(result));
    }
  });
});

app.use('/', express.static('public'));

const port = process.env.port || 3002;
app.listen(port);
