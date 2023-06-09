const startElement = document.querySelector('.start');
const portfolioHome = document.querySelector('.home');
const startH1 = document.querySelector('.start h1');

// Initial loading screen
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

// User time
function setCurrentTime() {
  var myDate = new Date();

  let daysList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let amOrPm;
  let twelveHours = function() {
    if (myDate.getHours() > 6 && myDate.getHours() < 19) {
      amOrPm = '☀️';     
      let twentyFourHourTime = myDate.getHours();
    } else {
      amOrPm = '🌙';
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

setInterval(function() {
  setCurrentTime();
}, 1000);


