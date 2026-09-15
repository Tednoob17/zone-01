let components = ['motor', 'sensor', 'battery', 'camera'];
let firstPart = robotParts[0];
let lastPart = robotParts[robotParts.length - 1];
let comboParts = [lastPart, firstPart];
let temp = swapComponents[0];
replaceComponents[2] = 'enhanced';
swapComponents[0] = swapComponents[1];
swapComponents[1] = temp;