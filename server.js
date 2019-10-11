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
	// apiCall(httpResponse, url,header)
	const loginOptions = {
		url: `https://www.eventcinemas.co.nz/cinebuzz/login?Username=dabalnce&Password=${process.env.cineBuzz}`,
		method: 'POST'
	};
	apiCall(loginOptions, (loginResponse, loginBody) => {
		const cookie = loginResponse.headers['set-cookie'];
		const bookingsOptions = {
			url: 'https://www.eventcinemas.co.nz/cinebuzz/getpastbookings',
			method: 'POST',
			headers: { Cookie: cookie }
		};
		apiCall(bookingsOptions, (bookingsResponse, bookingsBody) => {
			//Lets parse this ugly HTML into some Mighty Fine JSON
			const htmlResult = HTMLParser.parse(bookingsBody);
			const html = htmlResult.querySelectorAll('.\\"booking\\"');
			let jsonBookings = [];
			let previousJsonEntry;
			for (let x in html) {
				const booking = html[x]
					.removeWhitespace()
					.text.replace(/(?:\\[rn])+/g, ',')
					.slice(1, -1);
				const entry = booking.split(',');
				const jsonEntry = {
					Title: entry[0],
					Date: entry[1],
					Time: entry[2].slice(1, 9),
					Location: entry[2].slice(13),
					Points: entry[3]
				};
				// Eliminating unwanted results
				// Firstly, duplicates (Where I booked tickets for multiple people)
				if (
					jsonEntry.Title != previousJsonEntry &&
					//If it was at WestCity, it was someone using my card (glitch in their system)
					!jsonEntry.Location.includes('Westcity') &&
					//If location is empty (date is headoffice), it was because I was granted points, because of someone using my card.
					!(jsonEntry.Location == '')
				) {
					previousJsonEntry = jsonEntry.Title;
					jsonBookings.push(jsonEntry);
				}
			}
			httpResponse.send(jsonBookings);
		});
	});
});

app.use('/', express.static('public'));

const port = process.env.port || 3002;
app.listen(port);
