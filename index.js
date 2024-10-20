/// <reference types="../CTAutocomplete" />

import { registerWhen } from "../BloomCore/utils/Utils"
import RenderLib from "../RenderLib"

let blocks = []
let temp = []
let itsHappening = false

const BUTTONWIDTH = 0.4
const BUTTONHEIGHT = 0.26
registerWhen(register("renderWorld", () => {
    const b = [...blocks]
    for (let i = 0; i < b.length; i++) {
        let [x, y, z] = b[i].split(",").map(a => parseInt(a))
        let color = [0, 1, 0]
        if (i == 1) color = [1, 1, 0]
        else if (i > 1) color = [1, 0, 0]

        if (Config.simonSolverStyle == 0) RenderLib.drawInnerEspBox(x+0.29, y+0.2, z+0.5, 0.6, 0.6, ...color, 0.7, false)
        else RenderLib.drawInnerEspBox(x-0.5, y+0.5-BUTTONHEIGHT/2+0.001, z+0.05, BUTTONWIDTH, BUTTONHEIGHT, ...color, 0.7, false)
    }
}), () => blocks.length);

registerWhen(register("renderWorld", () => {
  if(!blocks.length) return;
  let blockStr = blocks[blocks.length-1]
  let [x, y, z] = blockStr.split(",")
  x = parseFloat(x) - .5
  z = parseFloat(z) + .4
  RenderLib.drawInnerEspBox(x, y, z, 1, 1, 0, .5, .5, .75, 0);
}), () => itsHappening);

// Vector3f[-17.0, 5.0, -26.0]
let timer = 0
register("playerInteract", (action, pos) => {
  if(itsHappening) return;
  if(action.toString() !== "RIGHT_CLICK_BLOCK") return
  let [x, y, z] = [pos.getX(), pos.getY(), pos.getZ()]

  // SS Start Button, reset everything
  if (x == -17 && y == 5 && z == -26) {
      blocks = []
      temp = []
      itsHappening = true
      temp = genPattern()
      let zzz = 0
      for (let idx = 0; idx < 6; idx++) {
        setTimeout(() => {
          addToBlocks(zzz)
          zzz++
        }, 500 * idx)
    }
      return
  }
  if(!blocks) return;
  let isButton = World.getBlockAt(x, y, z).type.getID() == 77
  let str = [x+1, y, z+1].join(",")
  if (!isButton) return
  if(blocks[0] != str) {
    ChatLib.chat("You Failed!");
    blocks = []
    temp = []
    timer = 0;
    return;
  }

  // if(blocks.length==5) timer = Date.now()
  blocks = blocks.splice(1)
  World.playSound("note.pling", 1, 2)
  if(blocks.length==0) {
    ChatLib.chat(`SS Completed in ${((Date.now()-timer)/1000).toFixed(2)}`)
  }
})

function addToBlocks(num) {
  if(num==5) {
    itsHappening = false
    timer = Date.now()
    return
  }
  blocks.push(temp[num])
}


function genPattern() {
  let buttons = genButtons()
  shuffle(buttons)
  return buttons.slice(0, 5);
}

function genButtons() {
  let [x0, y0, z0] = [-17, 4.0, -25]
  let buttons = []
  for (let dy = 0; dy <= 3; dy++) {
    for (let dz = 0; dz <= 3; dz++) {
        let [x, y, z] = [x0 - dz, y0 + dy, z0]
        let str = [x, y, z].join(",")
        buttons.push(str)
    }
  }
  return buttons
}

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
