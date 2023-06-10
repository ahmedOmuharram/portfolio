const startElement = document.querySelector('.start');
const portfolioHome = document.querySelector('.home');
const startH1 = document.querySelector('.start h1');

setTimeout(() => {
  startElement.classList.add('hidden');
  portfolioHome.classList.remove('hidden');
}, 11400
);

setTimeout(() => {
  var d = new Date();
  var c_hour = d.getHours();
  var c_min = d.getMinutes();
  var c_sec = d.getSeconds();
  var t = c_hour + ":" + c_min + ":" + c_sec;
  startH1.textContent = "Welcome to my portfolio";
  startH1.style.fontSize = 3 + 'vw';
}, 6000
);

function setCurrentTime() {
  var myDate = new Date();

  let daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let amOrPm;
  let twelveHours = function() {
    const timePhoto = document.getElementById('time-container');
    if (myDate.getHours() > 6 && myDate.getHours() < 19) {
      amOrPm = '☀️';     
      let twentyFourHourTime = myDate.getHours();
      timePhoto.style.backgroundImage = 'url("media/morning.jpeg")';
    } else {
      amOrPm = '🌙';
      timePhoto.style.backgroundImage = 'url("media/night.png")';
    }
    return `${myDate.getHours()}`
  };

  let hours = twelveHours();
  let minutes = myDate.getMinutes();

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  if (hours > 12) {
    hours -= 12;
  }
  
  let currentTime = `${hours}:${minutes}`;
  let day = daysList[myDate.getDay()];
  let today = `${amOrPm} ${day}`;
  
  document.querySelector('.current-time').textContent = today + ', ' + currentTime;
}

var boxElement = document.querySelector('.box');
var animation;

function skipAnimation() {
  startElement.classList.add('hidden');
  portfolioHome.classList.remove('hidden');
}

function play() {
  var pronunciation = new Audio('https://en-audio.howtopronounce.com/1628064468610a4ad439bfc.mp3');
  pronunciation.play();
}

setInterval(function() {
  setCurrentTime();
}, 1000);


setInterval(function() {
  rain.currentTime = 0;
}, 22000);

var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;

if (isSafari) {
  var rain = new Audio("media/rain.wav");
} else {
  var rain = new Audio("media/rain.ogg");
}

var slider = document.getElementById("music");


slider.oninput = function() {
  if (this.value > 0) {
    rain.play();
    rain.volume = this.value/100;
  }
}