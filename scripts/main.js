//global variables:
var wKey = config.WEATHER_KEY;
var nytKey = config.NYT_KEY;
//NYTimes API
let topStoriesURL = "https://api.nytimes.com/svc/topstories/v2/politics.json?api-key=" + nytKey; //topstories url
let abstracts = "";
let titles = "";
let titleArray = [];
let absArray = [];
let article_links = [];
let nyt_sentiment; //use to hold sentiment of abstracts
let topics = ["politics", "world", "arts"];


//OpenWeather API
let weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=Manhattan&appid=" + wKey;
let weatherDescr = [];
//icons provided by openweathermap.org/weather-conditions
var icons = {
    "clear sky" : "01n.png",
    "few clouds" : "02n.png",
    "scattered clouds" : "03n.png",
    "broken clouds" : "04n.png",
    "shower rain" : "09n.png",
    "rain" : "10n.png",
    "thunderstorm" : "11n.png",
    "snow" : "13n.png",
    "mist" : "50n.png",
    "overcast clouds": "04n.png",
    "haze" : "50d.png",
    "freezing rain" : "13d.png"
}


//using ml5 sentiment in replacement of node red
//https://ml5js.org/reference/api-Sentiment/
const sentiment = ml5.sentiment('movieReviews', modelReady);

function modelReady() { //use as initializer for api calls, need to wait for ml5
  console.log("model loaded!");
  //getNewsData();
  //getWeatherData();
}

function getTopicData(topic) {
  $.ajax({
    url: "https://api.nytimes.com/svc/topstories/v2/" + topic + ".json?api-key=" + nytKey,
    type: 'get',
    dataType: 'json',
    error: function(err) {
      console.log("error with top stories call: ");
      console.log(err);
    },
    success: function(data) {
      console.log(data.results[0]);
      storeTitlesAbstracts(data, topic);
    }
  }); //end ajax
}

//grab weather for Manhattan
function getWeatherData() {
  $.ajax({
    url: weatherURL,
    type: 'get',
    dataType: 'json',
    error: function(err) {
      console.log("error with openweather call: ");
      console.log(err);
    },
    success: function(data) {
      console.log(data);
      let descr = data.weather[0].description;
      let temperature = Math.floor((1.8 * (data.main.temp - 273) ) + 32); //convert from K to F
      console.log("Weather Description: " + descr);
      console.log("temp: " + temperature);
      weatherDescr[0] = descr;
      weatherDescr[1] = temperature;

      displayWeather();
    }
  }); //end ajax
} //end getData

function storeTitlesAbstracts(data, topic) {
    for(i = 0; i < 10; i++) {
        titles += data.results[i].title + " ";
        abstracts += data.results[i].abstract + " ";
        titleArray[i] = data.results[i].title;
        absArray[i] = data.results[i].abstract;
        article_links[i] = data.results[i].url;
    }
    console.log(abstracts);
    console.log(titles);
    newsSentiment(titles, topic);
}

function newsSentiment(inText, topic) {
  const prediction = sentiment.predict(inText);
  nyt_sentiment = prediction.score.toFixed(2);
  console.log(prediction.score);
  //$(".holder").html("<p>The news today has a sentiment of: " + nyt_sentiment + "</p>");
  if(nyt_sentiment < 0.6) {
    $(".sentimentHolder").html("<p>The " + topic + " news today is neutral with a score of: " + nyt_sentiment + "</p>");
    //$(".topTitles").css("display", "block");
    showTitles();
  }
  if(nyt_sentiment < 0.5) {
    $(".sentimentHolder").html("<p>The " + topic + " news today is negative with a score of: " + nyt_sentiment +
    ". If you would still like to see the update, click the below to receive an overview.</p>");
    $(".topTitles").css("display", "none");
    showTitles();
  }
  else {
    $(".sentimentHolder").html("<p>The " + topic +  " news today is positive with a score of: " + nyt_sentiment + "</p>");
    $(".topTitles").css("display", "block");
    showTitles();
  }
}

//display titles
function showTitles() {
  let htmlStr = "<h3>Here is your requested news overview: </h3>";
  for(i = 0; i < 10; i++){
    htmlStr = htmlStr + "<h4>" + titleArray[i] + "</h4>";
    htmlStr = htmlStr + "<p>" + absArray[i] + "</p>";
  }
  $(".topTitles").html(htmlStr);
  if(nyt_sentiment < 0.5) {
    $(".topTitles").css("display", "none");
    $(".titleToggle").css("display", "block");
  }
}

function displayWeather() {
  let iconSRC = icons[weatherDescr[0]];

  let htmlStr = "<p>It's currently " + weatherDescr[0] + " in Manhattan.</p>";
  htmlStr += "<p>The temperature is " + weatherDescr[1] + " degrees Fahrenheit.</p>";
  htmlStr += "<image src='http://openweathermap.org/img/wn/" + iconSRC + " 'alt='http://openweathermap.org/img/wn/10d.png'>";
  $(".weatherHolder").html(htmlStr);
}

function showNegative(){
  $(".topTitles").css("display", "block");
}
