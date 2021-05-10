//global variables:
var wKey = config.WEATHER_KEY;
var nytKey = config.NYT_KEY;
//NYTimes API
let topStoriesURL = "https://api.nytimes.com/svc/topstories/v2/politics.json?api-key=" + nytKey; //topstories url
let abstracts = "";
let titles = "";
let topics = ["arts", "business", "movies", "opinion", "politics", "world", "us"];
let topicScores = [];
let titleArray = [];
let absArray = [];
let article_links = [];
let nyt_sentiment; //use to hold sentiment of abstracts



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
    "freezing rain" : "13d.png",
    "moderate rain" : "10n.png"
}



//using ml5 sentiment in replacement of node red
//https://ml5js.org/reference/api-Sentiment/
const sentiment = ml5.sentiment('movieReviews', modelReady);

function modelReady() { //use as initializer for api calls, need to wait for ml5
  console.log("model loaded!");
  getWeatherData();
//  getNewsScores();
}

function readEmotion() {
  let inStr = document.getElementById("emotionForm").value;
  let emotion = sentiment.predict(inStr);
  console.log("score: " + emotion.score);
  document.getElementById("emotionForm").value = '';
  giveEmotionResult(emotion.score);
}

function giveEmotionResult(score) {
  let htmlStr = "";
  if(score > 0.0 && score < 0.4) {
    console.log("bad day");
    htmlStr += "<p>Wow, sounds like a bad day, maybe this will help?</p>";
    htmlStr += "<image class ='happyPic' src='https://www.aspca.org/sites/default/files/blog_no-pet-store-puppies_071620_main.jpg'>";
    if(weatherDescr[0] != null && weatherDescr[0] == "clear sky") {
      htmlStr += "<p>The weather is nice, maybe some time outside will help?</p>";
    }
    $(".emotionHolder").html(htmlStr);
  }
  if(score >= 0.4 && score < 0.6) {
    console.log("rough day");
    htmlStr += "<p>Seems like today might be a little rough. Let's see what we can do to help.</p>";
    $(".emotionHolder").html(htmlStr);
  }
  if(score >= 0.6 && score < 0.8) {
    console.log("decent day");
    htmlStr += "<p>Having an average day? Let's check the weather...</p>";
    $(".emotionHolder").html(htmlStr);
  }
  if(score >= 0.8 && score < 1.0) {
    console.log("positive day");
    htmlStr += "<p>You're pretty positive today! Let's see what else we can do!</p>";
    $(".emotionHolder").html(htmlStr);
  }
  else{
    console.log("amazing day");
    htmlStr += "<p>Seems like you're feeling great! You've got this!</p>";
    $(".emotionHolder").html(htmlStr);
  }
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
      //console.log(data.results[0]);
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
    //console.log(abstracts);
    //console.log(titles);
    newsSentiment(titles, topic);
}

function newsSentiment(inText, topic) {
  let htmlStr = "";
  const prediction = sentiment.predict(inText);
  nyt_sentiment = prediction.score.toFixed(2);
  console.log(prediction.score);
  if(nyt_sentiment < 0.6) {
    $(".sentimentHolder").html("<p>The " + topic + " news today is neutral with a score of: " + nyt_sentiment + "</p>");
    //$(".topTitles").css("display", "block");
    showTitles();
  }
  if(nyt_sentiment < 0.5) {
    $(".sentimentHolder").html("<p>&#128121; The " + topic + " news today is negative with a score of: " + nyt_sentiment +
    ". If you would still like to see the update, click the below to receive an overview.</p>");
    htmlStr = "<p>The " + topic + " news today is negative with a score of: " + nyt_sentiment +
    ". If you would still like to see the update, click the below to receive an overview.</p>"
    $(".sentimentHolder").html(htmlStr);
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
    //htmlStr = htmlStr + "<h4>" + titleArray[i] + "</h4>";
    htmlStr += "<a href='" + article_links[i] + "' class='newsLink'>" + titleArray[i] + "</a>";
    htmlStr = htmlStr + "<p>" + absArray[i] + "</p>";
  }
  $(".topTitles").html(htmlStr);
  if(nyt_sentiment < 0.5) {
    $(".topTitles").css("display", "none");
    $(".titleToggle").css("display", "block");
  }
}

function displayWeather() {
  let temp = weatherDescr[1];
  let condition = weatherDescr[0];
  let iconSRC = icons[weatherDescr[0]];
  let htmlStr = "<p>Current condition: " + condition + "</p>";
  htmlStr += "<p>Temperature: " + temp + "</p>";
  htmlStr += "<image src='http://openweathermap.org/img/wn/" + iconSRC + " 'alt='http://openweathermap.org/img/wn/10d.png'>";
  $(".weatherHolder").html(htmlStr);

  //change background color based on Temperature
  if(temp >= 80){
    $(".weatherParent").css("background-color", "red");
  }
  if(temp >= 60 && temp < 80) {
    $(".weatherParent").css("background-color", "orange");
  }
  if(temp >= 40 && temp < 60) {
    $(".weatherParent").css("background-color", "#c3dcff");
  //  $(".weatherParent").css("color", "white");
  }
  if(temp >= 20 && temp < 40) {
    $(".weatherParent").css("background-color", "gray");
    $(".weatherParent").css("color", "white");
  }
}

function showNegative(){
  $(".topTitles").css("display", "block");
}
