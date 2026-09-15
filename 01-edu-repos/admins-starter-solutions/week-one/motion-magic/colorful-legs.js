const button = document.querySelector('button')
const speakButton = document.querySelector('button#speak-button')

const armColorButton = document.getElementById('arm-color');
const armLeft =  document.getElementById('arm-left');
const armRight =  document.getElementById('arm-right')



const legColorButton = document.getElementById('leg-color');
const legLeft =  document.getElementById('leg-left');
const legRight =  document.getElementById('leg-right')

const handleClick = (event) => {
  const myDiv = document.getElementById('eye-left')
  if (myDiv.style.backgroundColor === 'black') {
    document.getElementById('btn').textContent = 'Click to close the left eye'
    myDiv.style.backgroundColor = 'red'
  } else {
    document.getElementById('btn').textContent = 'Click to open the left eye'
    myDiv.style.backgroundColor = 'black'
  }
  myDiv.classList.toggle("eye-closed")
}

const handleSpeakClick = (event) => {

  const body = document.querySelector('#torso');
  const existingDiv = document.querySelector('#torso .words');

  if (existingDiv) {
    body.removeChild(existingDiv);
  } else {
    const div = document.createElement('div');
    div.classList.add('words');
    div.textContent = 'Hello World!';
    body.append(div);
  }
}

const handleChangeArmColor = (event) => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    armRight.style.backgroundColor = randomColor;
    armLeft.style.backgroundColor = randomColor;
};


const handleChangeLegColor = (event) => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    legRight.style.backgroundColor = randomColor;
    legLeft.style.backgroundColor = randomColor;
};

armColorButton.addEventListener('click', handleChangeArmColor);
legColorButton.addEventListener('click', handleChangeLegColor);

button.addEventListener('click', handleClick)
speakButton.addEventListener('click', handleSpeakClick)