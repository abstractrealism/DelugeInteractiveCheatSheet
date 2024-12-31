// =====================
// Global Configuration
// =====================
var lg = (msg) => console.log(msg);


const contextManager = {
    currentContext: "song",
    displayMode: "rows", // Default view for song mode
    lastSongMode: "song", // Tracks the last song-related mode
    lastClipSubView: "default", // Tracks last clip sub-view
    lastNonKeyboardView: "default", // Tracks the last non-keyboard clip view
    clipBlinking: false, // Flag for clip button blinking

    views: {
        song: ["rows", "grid", "performance"],
        clip: ["default", "keyboard", "automation", "waveform", "velocity"],
        arranger: ["default", "performance"], // Arranger sub-views
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

    // Initialize topButtons object
    deluge.topButtons = deluge.topButtons || {};

    // Add keyboard button to topButtons
    deluge.topButtons.keyboard = delugeSvgDoc.querySelector("#keyboard");
    // Add other topButtons
    deluge.topButtons.affectEntire = delugeSvgDoc.querySelector("#affectEntire");

    // ============== Song and Clip Buttons (Already Handled) ==============
    deluge.songButton = delugeSvgDoc.querySelector("#songButton");
    deluge.clipButton = delugeSvgDoc.querySelector("#clipButton");

    // Add listeners to Song and Clip buttons
    deluge.songButton.addEventListener("click", () => {
        if (contextManager.displayMode === "performance") {
            // Do nothing if in performance view
            return;
        }
    
        updateContext("song");
    });
    
    deluge.clipButton.addEventListener("click", () => {
        if (contextManager.currentContext === "clip") {
            updateContext("clip", "automation");
        } else {
            updateContext("clip");
        }
    });
    // ============== Mute and Audition Columns ==============
    deluge.muteColumn = Array.from(delugeSvgDoc.querySelector("#muteColumn").children);
    deluge.auditionColumn = Array.from(delugeSvgDoc.querySelector("#auditionColumn").children);

    // ============== Performance Buttons ==============
    deluge.performanceButtons = Array.from(delugeSvgDoc.querySelector("#performanceButtons").children);

    // ============== Clip Type Buttons ==============
    deluge.clipTypeButtons = Array.from(delugeSvgDoc.querySelector("#clipTypeButtons").children);

    // ============== Add Interaction or Debug Logging ==============
    // Example: Add click listeners to the muteColumn
    deluge.muteColumn.forEach((pad, index) => {
        pad.addEventListener("click", () => {
            console.log(`Mute pad ${index + 1} clicked.`);
            // Add additional functionality here
        });
    });

    // Example: Add click listeners to the auditionColumn
    deluge.auditionColumn.forEach((pad, index) => {
        pad.addEventListener("click", () => {
            console.log(`Audition pad ${index + 1} clicked.`);
            // Add additional functionality here
        });
    });

    // Example: Add click listeners to performanceButtons
    deluge.performanceButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            console.log(`Performance button ${index + 1} clicked.`);
            // Add additional functionality here
        });
    });

    // Example: Add click listeners to clipTypeButtons
    deluge.clipTypeButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            console.log(`Clip type button ${index + 1} clicked.`);
            // Add additional functionality here
        });
    });
    
    deluge.topButtons.keyboard.addEventListener("click", () => {
        if (contextManager.currentContext === "arranger") {
            if (contextManager.displayMode === "performance") {
                // Exit performance view to default view
                updateContext("arranger", "default");
            } else {
                // Enter performance view
                updateContext("arranger", "performance");
            }
        } else if (contextManager.currentContext === "song") {
            if (contextManager.displayMode === "performance") {
                // Exit performance view to rows
                updateContext("song", "rows");
            } else {
                // Enter performance view
                updateContext("song", "performance");
            }
        } else if (contextManager.currentContext === "clip") {
            if (contextManager.displayMode === "keyboard") {
                // Exit keyboard view to last non-keyboard view
                updateContext("clip", contextManager.lastNonKeyboardView);
            } else {
                // Enter keyboard view
                updateContext("clip", "keyboard");
            }
        }
    });

    console.log("SVG controls initialized:", deluge);
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

let arrangerBlinkInterval;
let clipBlinkInterval;

function updateContext(newContext, subView = null) {
    if (newContext === "song") {
        if (contextManager.currentContext === "clip") {
            newContext = contextManager.lastSongMode;
        } else if (contextManager.currentContext === "song") {
            if (contextManager.displayMode === "performance") return; // Do nothing in performance
            newContext = "arranger";
        } else if (contextManager.currentContext === "arranger") {
            if (contextManager.displayMode === "performance") return; // Do nothing in performance
            newContext = "song";
        }
    }

    if (newContext === "clip") {
        if (subView === "keyboard") {
            if (contextManager.displayMode === "keyboard") {
                // Return to last non-keyboard view
                subView = contextManager.lastNonKeyboardView;
            } else {
                // Save the last non-keyboard view
                contextManager.lastNonKeyboardView = contextManager.displayMode;
                subView = "keyboard";
            }
        } else if (contextManager.currentContext === "clip") {
            if (contextManager.displayMode === "automation") {
                subView = "default"; // Toggle back to default
                contextManager.clipBlinking = false;
            } else {
                subView = "automation"; // Toggle to automation
                contextManager.clipBlinking = true;
            }
        } else {
            contextManager.lastClipSubView = subView || "default";
            contextManager.clipBlinking = false;
        }
    }

    if (contextManager.views[newContext]) {
        contextManager.currentContext = newContext;

        if (subView && contextManager.isValidView(newContext, subView)) {
            contextManager.displayMode = subView;
        } else if (newContext === "clip") {
            contextManager.displayMode = contextManager.lastClipSubView || contextManager.views.clip[0];
        } else {
            contextManager.displayMode = contextManager.views[newContext][0];
        }

        console.log(`Context: ${contextManager.currentContext}, View: ${contextManager.displayMode}`);
        updateUI();
    } else {
        console.warn(`Invalid context: ${newContext}`);
    }
}



function updateUI() {
    const display = document.getElementById("contextDisplay");
    if (display) {
        display.innerText = `Mode: ${contextManager.currentContext}, View: ${contextManager.displayMode}`;
    }

    // Reset all buttons to their default color
    recolorButton(deluge.songButton, "#959595");
    recolorButton(deluge.clipButton, "#959595");
    recolorButton(deluge.topButtons.keyboard, "#959595");

    // Clear any previous blinking intervals
    if (arrangerBlinkInterval) clearInterval(arrangerBlinkInterval);
    if (clipBlinkInterval) clearInterval(clipBlinkInterval);

    switch (contextManager.currentContext) {
        case "song":
            recolorButton(deluge.songButton, "#00bbff"); // Song button stays lit
            if (contextManager.displayMode === "performance") {
                recolorButton(deluge.topButtons.keyboard, "#00bbff");
            }
            break;

        case "arranger":
            if (contextManager.displayMode === "performance") {
                recolorButton(deluge.topButtons.keyboard, "#00bbff");
            } else {
                let isSongBlue = false;
                arrangerBlinkInterval = setInterval(() => {
                    isSongBlue = !isSongBlue;
                    recolorButton(deluge.songButton, isSongBlue ? "#00bbff" : "#959595");
                }, 500);
            }
            break;

        case "clip":
            if (contextManager.displayMode === "keyboard") {
                recolorButton(deluge.topButtons.keyboard, "#00bbff");
                if (contextManager.lastNonKeyboardView === "automation") {
                    // Keep clip button blinking if last view was automation
                    let isClipBlue = false;
                    clipBlinkInterval = setInterval(() => {
                        isClipBlue = !isClipBlue;
                        recolorButton(deluge.clipButton, isClipBlue ? "#00bbff" : "#959595");
                    }, 500);
                } else {
                    recolorButton(deluge.clipButton, "#00bbff");
                }
            } else if (contextManager.displayMode === "automation") {
                let isClipBlue = false;
                clipBlinkInterval = setInterval(() => {
                    isClipBlue = !isClipBlue;
                    recolorButton(deluge.clipButton, isClipBlue ? "#00bbff" : "#959595");
                }, 500);
            } else {
                recolorButton(deluge.clipButton, "#00bbff");
            }
            break;
    }
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

//Need to test that this works and figure out how best to implement it, where to draw the info from, etc. 
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

function recolorButton(button, color) {
    if (button && button.children[0]) {
        // console.log(`Recoloring ${button.id || "unknown"} to ${color}`);
        button.children[0].style.fill = color;
    } else {
        console.warn("Invalid button or button structure:", button);
    }
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
