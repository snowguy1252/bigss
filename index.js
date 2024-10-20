/// <reference types="../CTAutocomplete" />

import { registerWhen } from "../BloomCore/utils/Utils"
import RenderLib from "../RenderLib"

const buttonLocations = [-17, -37];

let i = 0;
let timer = 0;
let onPhase = -1;
let locations = null;
let pattern = [];
let currentPattern = [];
let itsHappening = false;
let blockWrongClicks = true;
let buttonLocation = -1;

register("command", () => blockWrongClicks = !blockWrongClicks).setName("bigss");

const BUTTONWIDTH = 0.4
const BUTTONHEIGHT = 0.26
registerWhen(register("renderWorld", () => {
    if(itsHappening) renderBackground();
    const b = [...currentPattern]
    for (let i = 0; i < b.length; i++) {
        let [x, y, z] = b[i].split(",").map(a => parseInt(a))
        let color = [0, 1, 0]
        if (i == 1) color = [1, 1, 0]
        else if (i > 1) color = [1, 0, 0]

        if (Config.simonSolverStyle == 0) RenderLib.drawInnerEspBox(x+0.29, y+0.2, z+0.5, 0.6, 0.6, ...color, 0.7, false)
        else RenderLib.drawInnerEspBox(x-0.5, y+0.5-BUTTONHEIGHT/2+0.001, z+0.05, BUTTONWIDTH, BUTTONHEIGHT, ...color, 0.7, false)
    }
}), () => currentPattern.length);

function renderBackground() {
  let blockStr = currentPattern[i-1]
  let [x, y, z] = blockStr.split(",")
  x = parseFloat(x) - .5
  z = parseFloat(z) + .4
  RenderLib.drawInnerEspBox(x, y, z, 1, 1, 0, .5, .5, .75, 0);
}


register("playerInteract", (action, pos) => {
  if(action.toString() !== "RIGHT_CLICK_BLOCK") return;
  if(itsHappening) return;
  let [x, y, z] = [pos.getX(), pos.getY(), pos.getZ()]

  // if it's the start button
  if (y == 5 && z == -26 && buttonLocations.includes(x)) { 
    buttonLocation = buttonLocations.indexOf(x);
    reset();
    initSS();
    return;
  }

  // if its not the guy
  if(onPhase<0 || !pattern.length || timer == 0 || i<onPhase) return;

  let isButton = World.getBlockAt(x, y, z).type.getID() == 77
  if (!isButton) return
  let str = [x+1, y, z+1].join(",")
  
  if(currentPattern[0] != str) {
    if(blockWrongClicks) return;
    ChatLib.chat("You Failed!");
    return reset();
  }

  World.playSound("note.pling", 1, 2);
  currentPattern = currentPattern.splice(1);

  if(onPhase==4 && !currentPattern.length) {
    ChatLib.chat(`SS Completed in ${((Date.now()-timer)/1000).toFixed(2)}`);
    reset();
    return;
  }

  if(!currentPattern.length) {
    onPhase += 1;
    runPhase();
  }
})

function initSS() {
  timer = Date.now();
  onPhase = 1;
  locations = getLocations();
  pattern = shuffle(locations);
  runPhase();
}

function runPhase() {
  i = 0;
  itsHappening = true;
  for(let idx = 0; idx <= onPhase+1; idx++) {
    setTimeout( () => {
      if(i>onPhase) {
        itsHappening = false
        return;
      }
      currentPattern.push(pattern[i]);
      i++;
    }, 500 * idx);
  }
}

function getLocations() {
  let [x0, y0, z0] = [buttonLocations[buttonLocation], 4.0, -25];
  let buttons = [];
  for (let dy = 0; dy <= 3; dy++) {
    for (let dz = 0; dz <= 3; dz++) {
        let [x, y, z] = [x0 - dz, y0 + dy, z0];
        let str = [x, y, z].join(",");
        buttons.push(str);
    }
  }
  return buttons;
}

function shuffle(bigarray) {
  let array = [...bigarray]
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function reset() {
  i = 0;
  timer = 0
  onPhase = -1;
  pattern = [];
  currentPattern = [];
}
