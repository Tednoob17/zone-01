const button = document.querySelector('button')
const speakButton = document.querySelector('button#speak-button')

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
    div.textContent = 'Hello World';
    body.append(div);
  }
}

button.addEventListener('click', handleClick)
speakButton.addEventListener('click', handleSpeakClick)