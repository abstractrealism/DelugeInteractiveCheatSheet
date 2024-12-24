// =====================
// Global Configuration
// =====================
var lg = (msg) => console.log(msg);


const contextManager = {
    currentContext: "song",
    displayMode: "rows",

    views: {
        song: ["rows", "grid", "performance"],
        clip: ["default", "keyboard", "automation", "waveform", "velocity"],
        arranger: ["default"],
    },

    isValidView(context, subView) {
        return this.views[context] && this.views[context].includes(subView);
    },
};

var presets = {};
presets['presetA'] = new TestPreset('#aa23b0', '#19380a', '#56b390', '#808080')

const deluge = {}; // Global object for all SVG elements


    ///////DELUGE OBJECT SET UP//////
// =====================
// Initialization
// =====================

const testButton = document.getElementById("testButton");
testButton.addEventListener('click', testing);


function initializeGrid() {
    const delugeSvgDoc = document.querySelector("#delugeSVG").contentDocument;

    deluge.mainGrid = delugeSvgDoc.querySelector("#mainGrid");
    deluge.mainGridPads = [];

    for (let x = 0; x < deluge.mainGrid.children.length; x++) {
        deluge.mainGrid[`row${x}`] = deluge.mainGrid.children[x];
        for (let y = 0; y < deluge.mainGrid[`row${x}`].children.length; y++) {
            deluge.mainGrid[`row${x}`][`pad${y}`] = deluge.mainGrid[`row${x}`].children[y].children[0];
            deluge.mainGridPads.push(deluge.mainGrid[`row${x}`][`pad${y}`]);
        }
    }
}

function initializeSVGControls() {
    const delugeSvgDoc = document.querySelector("#delugeSVG").contentDocument;

    // Add listeners to SVG buttons
    delugeSvgDoc.querySelector("#songButton").addEventListener("click", () => {
        updateContext("song");
    });

    delugeSvgDoc.querySelector("#clipButton").addEventListener("click", () => {
        updateContext("clip");
    });
}

// deluge.mainGrid.addEventListener('click', function(event){
//     lg(event.target)
//     // lg(event.target.style)
//     const fillColor = window.getComputedStyle(event.target).getPropertyValue('fill');

//     // Check if it's the initial gray color
//     if (fillColor === "rgb(149, 149, 149)" || fillColor === "rgb(21, 246, 253)") {  // Checking both gray and the initial color
//         setRandomColor(event.target);
//         lg("in here");
//     } else {
//         lg("in there");
//         event.target.style.fill = "rgb(149, 149, 149)";  // Set back to gray
//     }
    

// });


// try {
//     // lg(deluge.mainGrid.row3.pad3.children[0])
//     // deluge.mainGrid.row3.pad3.children[0].fill = "#ff0000";
    
//     deluge.mainGrid.row4.pad4.style.fill = "#ff00ff";
//     // deluge.mainGrid.row2.pad2.children[0].setAttribute('fill', "#00ff00");

//     // lg(deluge.mainGrid.row3.pad3.children[0].fill)
//     // changeColor(deluge.mainGrid.row3.pad3.children[0], "#ff0000");
// } catch (error) {
//     lg(error)
// }



// =====================
// Core Logic
// =====================

function updateContext(newContext, subView = null) {
    if (contextManager.views[newContext]) {
        contextManager.currentContext = newContext;

        if (subView && contextManager.isValidView(newContext, subView)) {
            contextManager.displayMode = subView;
        } else {
            contextManager.displayMode = contextManager.views[newContext][0];
        }

        console.log(`Context: ${newContext}, View: ${contextManager.displayMode}`);
        updateUI();
    } else {
        console.warn(`Invalid context: ${newContext}`);
    }
}

function updateUI() {
    document.getElementById("contextDisplay").innerText =
        `Mode: ${contextManager.currentContext}, View: ${contextManager.displayMode}`;
}

var presetDiv = document.getElementById('preset-div');
    presetDiv.addEventListener('click', function(event){
    applyPreset(event.target.id)
});

function testing() {
    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 16; y++) {
            deluge.mainGrid["row"+x]['pad'+y].style.fill = "#"+y.toString(16)+y.toString(16)+y.toString(16)
            
        }
    }

    //randomize main grid
    // for (var x = 0; x < deluge.mainGridPads.length; x++) {
    //     setRandomColor(deluge.mainGridPads[x])
    // }

}


/*

array per row
array each for mutes and auditions
array for gold knob parameter buttons
array for clip mode buttons (synth, kit, etc)
array of all other buttons
all of the above in a larger array or object

OR

object with each button outside the grid, 
then either coordinates per grid button or arrays per row

/////

Assuming object: deluge with properties like deluge.playButton
Recolor function: 
Func(button, preset){
 deluge[button].fill = preset[button];
}

Or

For (let button in deluge) {
 deluge[button].fill = preset[button]
}

Actually the second one could be recolor all and use the first one. 
Apply preset per button or to all. Recolor function same except second parameter is a color



## TO DO: 
Confirm all elements are nested the same way so it's always namedID.children[0] that has the fill color? Easier to reconfigure svg if need be than to have a ton of validating in function probably 
---the grid are all g > rect. the round buttons are all g > g > rect. recolor function can test #namedID.children[0].tagName = "g" and if yes recurse one more level

SVG size outlined text vs not
---much larger, but dealing with text too much of a nightmare

Couple of starting preset buttons 

OnClick for svg buttons (determine which, capture vs bubble etc)

In SVG, will need classes as well as IDs so all clip rows can share a behavior, for instance 

Need a way to keep track of state so when eventually buttons are interactive they correctly apply the correct preset based on current view and what was pressed, eg, pressing song from clip goes to song view, but from song view goes to arranger

How to turn knobs? Click and drag? To push turn click then click drag?


### PRESETS: 

#### Clip
Default
Shift/aud pushed
<> pushed
^v pushed

#### Song  
Same as clip, plus
Clip pad held

#### Arranger
Most of what clip has

#### Grid
TBD

#### Automation
TBD

*/

// =====================
// Utility Functions
// =====================

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function showPopupNearPad(pad, message) {
    const rect = pad.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.top + window.scrollY}px`;
    popup.innerHTML = message;

    document.body.appendChild(popup);
}

  
function TestPreset(tl, tr, bl, br) {
    this.tl = tl;
    this.tr = tr;
    this.bl = bl;
    this.br = br;
}

function setRandomColor(target) {
    // var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const randomColor = getRandomColor();
    target.style.fill = randomColor;  // Use style.fill instead of setAttribute
}


function changeColor(button, color) {
    button.fill = color;
    lg("what's going on??")

}

function applyPreset(targetID) {
    var presetToApply = presets[targetID];
    lg (deluge.mainGrid.row2.pad2.style.fill)
    deluge.mainGrid.row2.pad2.style.fill = "#ff0000";
    deluge.mainGrid.row2.pad3.style.fill = presetToApply.tr;
    deluge.mainGrid.row3.pad2.style.fill = presetToApply.bl;
    deluge.mainGrid.row3.pad3.style.fill = presetToApply.br;
    
}



// //Context / mode functions
// function updateContext(newContext) {
//     deluge.context = newContext;
//     console.log(`Context changed to: ${newContext}`);
// }



/////////////////////////
// =====================
// Application Execution
// =====================

window.addEventListener("load", function () {
    initializeGrid();
    initializeSVGControls();
    updateUI();
});//end on load
