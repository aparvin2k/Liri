//set variables requiring npm packages etc

var keys = require('./keys.js');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');
var inquirer = require('inquirer');
var fs = require('fs');

//set variables for inquirer prompt functions

var twitterPrompt = inquirer.createPromptModule();
var spotifyPrompt = inquirer.createPromptModule();
var moviePrompt = inquirer.createPromptModule();

//set variable to grab hidden Twitter keys

var client = new Twitter(keys.twitterKeys);
var spotify = new Spotify(keys.spotifyKeys);

//Use inquirer for selection of commands

inquirer.prompt([{
            type: "list",
            message: "What command would you like to run?",
            choices: ["tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
            name: "commands"
        }

    ]).then(function(user) {
            console.log(JSON.stringify(user, null, 2));

            //==========================================Twitter===============================================

            if (user.commands === "tweets") {

                //prompt user to input a twitter handle they want to read

                twitterPrompt([{
                        type: "input",
                        message: "Whose twitter posts would you like to read?",
                        name: "handle",
                        default: "KevinHart4Real"
                    }

                ]).then(function(user) {

                    //the user input will generate the last 20 posts from the handle they defined.

                    if (user.handle) {
                        //console.log("test");

                        var params = {
                            screen_name: user.handle,
                            count: 20
                        };

                        //console.log(params.screen_name);

                        client.get("statuses/user_timeline", params, function(error, response) {
                             if (!error) {
                                for (var i = 0; i < response.length; i++) {
                                    var time = response[i].created_at;
                                    var tweets = response[i].text;
                                    var user = params.screen_name;

                                    var content = "============================================ \n" + '\n' + 
                                        "----------------" + time + "--------------------------" + '\n' + 
                                        "@" + user + " tweeted:\n" + '\n' + tweets + '\n' + 
                                        "============================================" + '\n';

                                    console.log("============================================ \n" + '\n' + 
                                    	"----------------" + time + "--------------------------" + '\n' + 
                                    	"@" + user + " tweeted:\n" + '\n' + tweets + '\n' + 
                                    	"============================================" + '\n');
                                    // adding the log.txt file for twitter
                                    fs.appendFile("log.tx", '\n' + content + '\n', function(err){
                                    	if (err) {
                                    		console.log(err);
                                    	}
                                    })
                                }
                                //console.log(tweets);
                            } else {
                                console.log(error);
                            }
                        });

                    } else {
                        console.log("============================================\n");
                        console.log("Probably a wise choice! Try looking up a movie or song!\n");
                        console.log("============================================");
                    }

                });

                //=======================================Spotify===============================================

            } else if (user.commands === "spotify-this-song") {

                //prompt user to type in song to lookup - 'Regulate' by Warren G set as default
                spotifyPrompt([{
                        type: "input",
                        message: "What song should I look up?",
                        name: "song",
                        default: "Regulate Warren G"
                    }

                    //set up Spotify search for Track based on "song" input by user

                ]).then(function(response) {

                    spotify.search({
                        type: 'track',
                        query: response.song,
                        limit: 3
                    }, function(err, data) {
                        if (err) {
                            console.log('Error occurred: ' + err);
                            return;

                            //set up base path for finding information through Spotify API

                        }else {
                            var trackName = data.tracks.items;

                            //for loop through results to pick out desired information

                            for (var i = 0; i < 3; i++) {

                                var trackData = trackName[i];

                                var artists = trackData.artists[0].name;
                                var song = trackData.name;
                                var preview = trackData.preview_url;
                                var album = trackData.album.name;

                                //creating a varialble that will send data to the log.txt file

                                var content = "============================================\n" +
                                             "Artist: " + artists + "\n~~~~~~~~~~~~~~~~~~~~~"+ "\nSong Title: " + song + 
                                             "\n~~~~~~~~~~~~~~~~~~~~~" + "\nAlbum: " + album + "\n~~~~~~~~~~~~~~~~~~~~~" + 
                                             "\nSong Preview: " + preview + "\n============================================\n";
                                //console log out the information found on the track provided by user

                                console.log("============================================\n");
                                console.log("Artist: " + artists);
                                console.log("~~~~~~~~~~~~~~~~~~~~~");
                                console.log("Song Title: " + song);
                                console.log("~~~~~~~~~~~~~~~~~~~~~");
                                console.log("Album: " + album);
                                console.log("~~~~~~~~~~~~~~~~~~~~~");
                                console.log("Song Preview: " + preview + '\n');
                                console.log("============================================\n");

                                // adding the log.txt file
                                fs.appendFile("log.txt", '\n' + content + '\n', function (err){
                                    if (err) {
                                        console.log(err);
                                    }
                                })
                            }
                        }
                    });
                });


                //===========================================OMDB================================================

            } else if (user.commands === "movie-this") {

                moviePrompt([{
                        type: "input",
                        message: "What movie should I look up?",
                        name: "movie",
                        default: "Superbad"
                    }

                ]).then(function(response) {



                    //run a request to the OMDB API with the movie specified by user

                    request("http://www.omdbapi.com/?t=" + response.movie + "&y=&plot=short&apikey=40e9cece", function(error, response, body) {

                        // If there is no error, and the request is successful (i.e. if the response status code is 200)

                        if (!error && response.statusCode === 200) {

                            var content = "======================================" + "\nTitle: " + JSON.parse(body).Title +
                                          "\n~~~~~~~~~~~~~~~~~~~~~" + "\nRelease Date: " + JSON.parse(body).Year +
                                          "\n~~~~~~~~~~~~~~~~~~~~~" + "\nIMBD rating is: " + JSON.parse(body).imdbRating + 
                                          "\n~~~~~~~~~~~~~~~~~~~~~" + "\nProduced in (country): " + JSON.parse(body).Country +
                                          "\n~~~~~~~~~~~~~~~~~~~~~" + "\nMain language: " + JSON.parse(body).Language +
                                          "\n~~~~~~~~~~~~~~~~~~~~~" + "\nPlot: " + JSON.parse(body).Plot +
                                          "\n~~~~~~~~~~~~~~~~~~~~~" + "\nActor's include: " + JSON.parse(body).Actors +
                                          "\n======================================";

                            // Parse the body of the site and recover the info needed

                            console.log("======================================\n");
                            console.log("Title: " + JSON.parse(body).Title);
                            console.log("~~~~~~~~~~~~~~~~~~~~~");
                            console.log("Release Date: " + JSON.parse(body).Year);
                            console.log("~~~~~~~~~~~~~~~~~~~~~");
                            console.log("IMBD rating is: " + JSON.parse(body).imdbRating);
                            console.log("~~~~~~~~~~~~~~~~~~~~~");
                            console.log("Produced in (country): " + JSON.parse(body).Country);
                            console.log("~~~~~~~~~~~~~~~~~~~~~");
                            console.log("Main language: " + JSON.parse(body).Language);
                            console.log("~~~~~~~~~~~~~~~~~~~~~");
                            console.log("Plot: " + JSON.parse(body).Plot);
                            console.log("~~~~~~~~~~~~~~~~~~~~~");
                            console.log("Actor's include: " + JSON.parse(body).Actors + '\n');
                            console.log("======================================");

                            // adding log.txt for omdb
                            fs.appendFile("log.txt", '\n' + content + '\n', function(err){
                                if (err) {
                                    console.log(err);
                                }
                            })
                        }
                    });
                });

                //===============================================FS============================================

            } else if (user.commands === "do-what-it-says") {
                // This block of code will read from the "random.txt" file.
                // It's important to include the "utf8" parameter or the code will provide stream data (garbage)
                // The code will store the contents of the reading inside the variable "data"
                fs.readFile("random.txt", "utf8", function(error, data) {
                    if (error) {
                        console.log(error);
                    } else {
                       // splitting the data in the txt file
                       var dataArr = data.split(", ");

                       // console.log("My dataArr: " + dataArr);
                       // removing the "" from I want it that way
                       var dataSlice = dataArr[1].slice(1, -1);

                       // console.log("My dataSlice: " + dataSlice);

                        spotify.search({
                            type: 'track',
                            query: dataSlice,
                        }, function(err, data) {
                            if (err) {
                                console.log('Error occurred: ' + err);
                                return;

                                //set up base path for finding information through Spotify API

                            } else {
                                var trackName = data.tracks.items;

                                //for loop through results to pick out desired information

                                for (var i = 0; i < 1; i++) {

                                    var trackData = trackName[i];

                                    var artists = trackData.artists[0].name;
                                    var song = trackData.name;
                                    var preview = trackData.preview_url;
                                    var album = trackData.album.name;

                                    //creating a varialble that will send data to the log.txt file

                                    var content = "============================================\n" +
                                             "Artist: " + artists + "\n~~~~~~~~~~~~~~~~~~~~~"+ "\nSong Title: " + song + 
                                             "\n~~~~~~~~~~~~~~~~~~~~~" + "\nAlbum: " + album + "\n~~~~~~~~~~~~~~~~~~~~~" + 
                                             "\nSong Preview: " + preview + "\n============================================\n";

                                    //console log out the information found on the track provided by user

	                                console.log("============================================\n");
	                                console.log("Artist: " + artists);
	                                console.log("~~~~~~~~~~~~~~~~~~~~~");
	                                console.log("Song Title: " + song);
	                                console.log("~~~~~~~~~~~~~~~~~~~~~");
	                                console.log("Album: " + album);
	                                console.log("~~~~~~~~~~~~~~~~~~~~~");
	                                console.log("Song Preview: " + preview + '\n');
	                                console.log("============================================\n");

                                     // adding the log.txt file
                                    fs.appendFile("log.txt", '\n' + content + '\n', function (err){
                                            if (err) {
                                                console.log(err);
                                    }
                                })
                                }
                            }
                        });
                    }
                });
            }
          });
