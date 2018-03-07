

function UserAction() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            var response = JSON.parse(xhttp.responseText);
            // console.log(Object.keys(response)[0])
            // console.log(response.response.games[0].name);
            // console.log((response.response.games[0].playtime_forever)/60);
            document.getElementById("game_name").innerHTML = response.response.games[0].name;
            document.getElementById("game_time").innerHTML = (response.response.games[0].playtime_forever)/60;
        }
    };
    xhttp.open("GET", "http://ashraystats.azurewebsites.net/steam/latestgames", true);
    xhttp.send();
}

function calculateAge() { // birthday is a date
    var birthday = new Date("20 Dec 1996");
    var curr = Date.now();
    var diff = curr - birthday;

    var age = (diff/31557600000).toFixed(7); // Divide by 1000*60*60*24*365.25
    document.getElementById("my_age").innerHTML = age;
    //console.log("done");
}


function GetRank() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            //Bronze, Silver, Gold, Diamond, Platinum, Master, Challenger
            var loltiers = ["BRONZE", "SILVER", "GOLD", "DIAMOND", "PLATINUM", "MASTER", "CHALLENGER"];
            var lolranks = ["V", "IV", "III", "II", "I"];
            var response = JSON.parse(xhttp.responseText);

            var tierone = loltiers.indexOf(response[0].tier);
            var tiertwo = loltiers.indexOf(response[1].tier);
            if (tierone > tiertwo){
                document.getElementById("tier").innerHTML = response[0].tier;
                document.getElementById("rank").innerHTML = response[0].rank;
            }
            else if (tiertwo > tierone){
                document.getElementById("tier").innerHTML = response[1].tier;
                document.getElementById("rank").innerHTML = response[1].rank;
            }
            else{
                var rankone = lolranks.indexOf(response[0].rank);
                var ranktwo = lolranks.indexOf(response[1].rank); 
                if (rankone > ranktwo){
                    document.getElementById("tier").innerHTML = response[0].tier;
                    document.getElementById("rank").innerHTML = response[0].rank;
                }
                else if (ranktwo > rankone){
                    document.getElementById("tier").innerHTML = response[1].tier;
                    document.getElementById("rank").innerHTML = response[1].rank;
                }
                else{
                    document.getElementById("tier").innerHTML = response[0].tier;
                    document.getElementById("rank").innerHTML = response[0].rank;
                }
            }

            
        }
    };
    xhttp.open("GET", "http://ashraystats.azurewebsites.net/lol/rank", true);
    xhttp.send();
}


$( document ).ready(function() {
    calculateAge();
    setInterval(calculateAge, 1000);
    UserAction();
    GetRank();
});