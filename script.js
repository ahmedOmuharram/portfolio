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

  if (hours == 0) {
    hours = 12;
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

var rain = new Audio("media/rain.ogg");
var slider = document.getElementById("music");
var slidertext = document.getElementById("slidertext");

slider.oninput = function() {
  if (this.value <= 1) {
    slidertext.textContent = "🔇 Rain sounds";
    rain.pause();
  } else {
    slidertext.textContent = "🌧️ Rain sounds";
    rain.play();
    rain.volume = this.value/100;
  }
}

rain.addEventListener('timeupdate', function() {
  if (rain.currentTime >= 22) {
    rain.currentTime = 0;
  }
});

// Get all the anchor elements in the navbar
const anchors = document.querySelectorAll('.navbar a:not(#resume)');

// Add event listeners to each anchor element
anchors.forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor element

    // Get the ID of the target section from the href attribute
    const targetId = anchor.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (!targetSection.classList.contains('hidden')) {
      // Target section is already visible, no need to apply the fade-in animation
      return;
    }

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.classList.add('hidden');
    });

    // Show the target section
    targetSection.classList.remove('hidden');
    targetSection.style.animation = 'fade-in 0.5s ease-in';
  });
});



