// Function to change the arm colors of a robot
function changeArmColor(robotClass) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    
    // Change the color of the arms
    document.querySelector(`.${robotClass} #arm-left`).style.backgroundColor = randomColor;
    document.querySelector(`.${robotClass} #arm-right`).style.backgroundColor = randomColor;
  }
  
  // Function to change the leg colors of a robot
  function changeLegColor(robotClass) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    
    // Change the color of the legs
    document.querySelector(`.${robotClass} #leg-left`).style.backgroundColor = randomColor;
    document.querySelector(`.${robotClass} #leg-right`).style.backgroundColor = randomColor;
  }
  
  // Function to change the eye colors of a robot
  function changeEyeColor(robotClass) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    
    // Change the color of the eyes
    document.querySelector(`.${robotClass} #eye-left`).style.backgroundColor = randomColor;
    document.querySelector(`.${robotClass} #eye-right`).style.backgroundColor = randomColor;
  }
  
  // Function to change the face color of a robot
  function changeFaceColor(robotClass) {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    
    // Change the color of the face
    document.querySelector(`.${robotClass} #eyes`).style.backgroundColor = randomColor;
  }
  
  // Listen for keyboard presses
  document.addEventListener('keydown', function(event) {

    if (event.key === '1') { // Press '1' to change arms
      changeArmColor('oumaima-robot');
    }
    if (event.key === '2') { // Press '2' to change legs
      changeLegColor('oumaima-robot');
    }
    if (event.key === 'Q' || event.key === 'q') { // Press 'Q' to change eyes
      changeEyeColor('oumaima-robot');
    }
    if (event.key === 'A' || event.key === 'a') { // Press 'A' to change face
      changeFaceColor('oumaima-robot');
    }
  
    // Robot 2 (Louis's robot)
    if (event.key === '3') { // Press '3' to change arms
      changeArmColor('louis-robot');
    }
    if (event.key === '4') { // Press '4' to change legs
      changeLegColor('louis-robot');
    }
    if (event.key === 'W' || event.key === 'w') { // Press 'W' to change eyes
      changeEyeColor('louis-robot');
    }
    if (event.key === 'S' || event.key === 's') { // Press 'S' to change face
      changeFaceColor('louis-robot');
    }
  
    // Robot 3 (Amine's robot)
    if (event.key === '5') { // Press '5' to change arms
      changeArmColor('amine-robot');
    }
    if (event.key === '6') { // Press '6' to change legs
      changeLegColor('amine-robot');
    }
    if (event.key === 'E' || event.key === 'e') { // Press 'E' to change eyes
      changeEyeColor('amine-robot');
    }
    if (event.key === 'D' || event.key === 'd') { // Press 'D' to change face
      changeFaceColor('amine-robot');
    }
  });