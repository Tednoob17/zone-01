const button = document.getElementById('eye-btn')

const handleClick = (event) => {
  const eyeLeft = document.getElementById('eye-left')
  
  if (eyeLeft.style.backgroundColor === 'black') {
    button.textContent = 'Click to close the left eye'
    eyeLeft.style.backgroundColor = 'red'
  } else {
    button.textContent = 'Click to open the left eye'
    eyeLeft.style.backgroundColor = 'black'
  }
  eyeLeft.classList.toggle("eye-closed")
}
button.addEventListener('click', handleClick)