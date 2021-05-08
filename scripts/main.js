//global variables:
//NYTimes API
let topStoriesURL = ""; //topstories url
let abstracts = [];
let titles = [];

//OpenWeather API
let weatherURL = "";
let weatherDescr = [];
let cities = [];



//using ml5 sentiment in replacement of node red
//https://ml5js.org/reference/api-Sentiment/
const sentiment = ml5.sentiment('movieReviews', modelReady);

function modelReady() {
  console.log("model loaded!");
  app.makePrediction();
}


let text = "I hate today and do not want to do anything. horrible horrible horrible";
function modelReady() {
  console.log("model loaded!");
  makePrediction();
}

function makePrediction() {
  const prediction = sentiment.predict(text);
  console.log(prediction.score);
}
