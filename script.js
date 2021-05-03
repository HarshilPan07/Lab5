// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const selectImage = document.getElementById('image-input');
const generate_form = document.getElementById('generate-meme');
const btn_group = document.getElementById('button-group').querySelectorAll('button');
const clear_btn = btn_group[0];
const read_btn = btn_group[1];
const slider = document.getElementById('volume-group').querySelector('input');

var canvas = document.getElementById('user-image');
var ctx = canvas.getContext('2d');

var synth = window.speechSynthesis;
var dropdown = document.getElementById('voice-selection');
var voices = [];
var utterance_volume = 1.0;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions['startX'], dimensions['startY'], dimensions['width'], dimensions['height']);
  
  //  Generate to ON, others are OFF
  toggle_buttons(false);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

selectImage.addEventListener('change', (event) => {
  img.src = URL.createObjectURL(event.target.files[0]);
  selectImage.alt = event.target.files[0].name;
});

generate_form.addEventListener('submit', (event) => {
  ctx.font = "40px serif";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  var top_text = document.getElementById('text-top').value;
  var bottom_text = document.getElementById('text-bottom').value;
  console.log(top_text);
  console.log(bottom_text);

  ctx.fillText(top_text, canvas.width/2, 40);
  ctx.fillText(bottom_text, canvas.width/2, 370);
  
  //  Disable generate, enable clear, read text, and voice option select
  toggle_buttons(true);

  event.preventDefault();
});

clear_btn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  toggle_buttons(false);
});

read_btn.addEventListener('click', (event) => {
  event.preventDefault();

  var input_text = document.getElementById('text-top').value + 
                    document.getElementById('text-bottom').value;
  var utterThis = new SpeechSynthesisUtterance(input_text);
  var selectedOption = dropdown.selectedOptions[0].getAttribute('data-name');
  
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
  
  utterThis.volume = utterance_volume;
  synth.speak(utterThis);
});

slider.addEventListener('input', (event) => {
  var slider_volume = slider.valueAsNumber; 
  var volume_icon = document.getElementById('volume-group').querySelector('img');
  utterance_volume = slider_volume/100;

  if(slider_volume == 0) {
    volume_icon.src = 'icons/volume-level-0.svg';
  }
  else if(slider_volume > 0 && slider_volume <= 33) {
    volume_icon.src = 'icons/volume-level-1.svg';
  }
  else if(slider_volume > 33 && slider_volume <= 66) {
    volume_icon.src = 'icons/volume-level-2.svg';
  }
  else {
    volume_icon.src = 'icons/volume-level-3.svg';
  }
  console.log('inside volume');
  
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}

function toggle_buttons(toggle) {
  var generate_btn = document.getElementById('generate-meme').querySelector('button');
  var btn_list = document.getElementById('button-group').querySelectorAll('button');
  
  if(toggle)
  {
    generate_btn.disabled = true;
    btn_list[0].disabled = false;
    btn_list[1].disabled = false;
    dropdown.disabled = false;
    init_selection_dropdown();
  }
  else
  {
    generate_btn.disabled = false;
    btn_list[0].disabled = true;
    btn_list[1].disabled = true;
    dropdown.disabled = true;
  }
}

function init_selection_dropdown() {
  voices = synth.getVoices();

  for(let i = 0; i < voices.length; i++)
  {
    var option = document.createElement('option');
    option.textContent = voices[i].name +  ' (' + voices[i].lang + ')';
    
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    dropdown.appendChild(option);
  }
}
