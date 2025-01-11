// =====================
// Global Configuration
// =====================
var lg = (msg) => console.log(msg);

//actually, should have a similar global constant to the context manager that's for the song project file. contextmanager should stay just about views / context
const projectFile = {
    scale: "major",
    rootNote: "C-2",
    projectClips: [],
};



const contextManager = {
    currentContext: "song",
    displayMode: "rows", // Default view for song mode
    lastSongMode: "song", // Tracks the last song-related mode
    lastClipSubView: "default", // Tracks last clip sub-view
    lastNonKeyboardView: "default", // Tracks the last non-keyboard clip view
    clipBlinking: false, // Flag for clip button blinking
    songAffectEntire: false, //is song mode in Affect Entire

    views: {
        song: ["rows", "grid", "performance"],
        clip: ["default", "keyboard", "automation", "waveform", "velocity"],
        arranger: ["default", "performance"], // Arranger sub-views
    },

    isValidView(context, subView) {
        return this.views[context] && this.views[context].includes(subView);
    },
    activeClip: null,
};

var presets = {};
presets['presetA'] = new TestPreset('#aa23b0', '#19380a', '#56b390', '#808080')

const deluge = {}; // Global object for all SVG elements
deluge.allButtons = [];

    ///////DELUGE OBJECT SET UP//////
// =====================
// Initialization
// =====================

// Define the constructor for Clips
function Clip(clipType, section, scaleMode) {
    this.clipType = clipType;
    this.bars = 1;
    this.scaleMode = scaleMode;
    this.activePerformanceButton = 1;
    this.notes = []; // You can add notes later if needed
    this.setSection(section);

}
// Setter method to validate the section
Clip.prototype.setSection = function(section) {
    const sectionIndex = validSections.indexOf(section);
    if (sectionIndex === -1 || sectionIndex > highestUsedSectionIndex + 1) {
        throw new Error(
            `Invalid section: ${section}. You can only set sections up to ${validSections[highestUsedSectionIndex + 1]}.`
        );
    }
    this.section = section;

    // Update the highest used section index if necessary
    if (sectionIndex > highestUsedSectionIndex) {
        highestUsedSectionIndex = sectionIndex;
    }
};

// Declare the validSections array globally
const validSections = ["blue", "magenta", "yellow", "red"];

// Global variable to track the highest section color currently in use
let highestUsedSectionIndex = 0;


const testButton = document.getElementById("testButton");
testButton.addEventListener('click', testing);

//this could just go in SVGControls?
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
        deluge.mainGrid[`row${x}`].clip = false;
    }
}

function initializeSVGControls() {
    const delugeSvgDoc = document.querySelector("#delugeSVG").contentDocument;

    // Initialize topButtons object
    deluge.topButtons = deluge.topButtons || {};

    // Add keyboard button to topButtons
    deluge.allButtons.push(deluge.topButtons.keyboard = delugeSvgDoc.querySelector("#keyboard"));
    // Add other topButtons
    deluge.allButtons.push(deluge.topButtons.affectEntire = delugeSvgDoc.querySelector("#affectEntire"));

    // ============== Song and Clip Buttons (Already Handled) ==============
    deluge.allButtons.push(deluge.songButton = delugeSvgDoc.querySelector("#songButton"));
    deluge.allButtons.push(deluge.clipButton = delugeSvgDoc.querySelector("#clipButton"));

    // Add listeners to Song and Clip buttons
        ////SONG BUTTON!//////
    deluge.songButton.addEventListener("click", () => {
        if (contextManager.currentContext === "clip") {
            // Return to the last song-related mode
            contextManager.lastClipSubView = contextManager.displayMode;
            updateContext(contextManager.lastSongMode);
            
        } else if (contextManager.currentContext === "song") {
            if (contextManager.displayMode === "performance") {
                // Do nothing in performance view
                return;
            }
            // Switch to arranger
            updateContext("arranger");
        } else if (contextManager.currentContext === "arranger") {
            if (contextManager.displayMode === "performance") {
                // Do nothing in performance view
                return;
            }
            // Switch to song
            updateContext("song");
        }
    });
    
    ////CLIP BUTTON!//////
    deluge.clipButton.addEventListener("click", () => {
        if (contextManager.currentContext === "clip") {
            if (contextManager.displayMode === "keyboard") {
                contextManager.lastNonKeyboardView === "default" ? contextManager.lastNonKeyboardView = "automation" : contextManager.lastNonKeyboardView = "default"
                // updateContext("clip", contextManager.lastNonKeyboardView);
                updateUI();
            } else if (contextManager.displayMode === "automation") {
                contextManager.clipBlinking = false;
                updateContext("clip", "default");
            } else {
                contextManager.clipBlinking = true;
                updateContext("clip", "automation");
            }
        } else {
            // Re-open the last clip sub-view
            lg(contextManager.lastClipSubView)
            updateContext("clip", contextManager.lastClipSubView);
            
        }
    });
   
    /////////   KEYBOARD BUTTON
    deluge.topButtons.keyboard.addEventListener("click", () => {
        if (contextManager.currentContext === "arranger") {
            if (contextManager.displayMode === "performance") {
                // Exit arranger performance view
                updateContext("arranger", "default");
            } else {
                // Enter arranger performance view
                updateContext("arranger", "performance");
            }
        } else if (contextManager.currentContext === "song") {
            if (contextManager.displayMode === "performance") {
                // Exit song performance view
                updateContext("song", "rows");
            } else {
                // Enter song performance view
                updateContext("song", "performance");
            }
        } else if (contextManager.currentContext === "clip") {
            if (contextManager.displayMode === "keyboard") {
                // Exit keyboard view to last non-keyboard view
                updateContext("clip", contextManager.lastNonKeyboardView);
            } else {
                // Save last non-keyboard view and enter keyboard view
                contextManager.lastNonKeyboardView = contextManager.displayMode;
                updateContext("clip", "keyboard");
            }
        }
    });
   
    deluge.topButtons.affectEntire.addEventListener("click", () => {
        if (contextManager.currentContext === "arranger" || contextManager.currentContext === "song") {
            //toggle affect entire button for song modes
            contextManager.songAffectEntire = !contextManager.songAffectEntire;
            updateUI();
        } else if (false && contextManager.currentContext === "clip" && cliptype === "kit") {
            //TD: remove the false once kit clips are implemented
            //kit.affectEntire = false or somethinglike that
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
        deluge.allButtons.push(pad);
        pad.addEventListener("click", () => {
            console.log(`Mute pad ${index + 1} clicked.`);
            // Add additional functionality here
        });
    });

    // Example: Add click listeners to the auditionColumn
    deluge.auditionColumn.forEach((pad, index) => {
        deluge.allButtons.push(pad);
        pad.addEventListener("click", () => {
            console.log(`Audition pad ${index + 1} clicked.`);
            // Add additional functionality here
            switch (contextManager.currentContext) {
                case "song":
                    if (deluge.mainGrid[`row${index}`].clip) {
                        changeSectionColor(deluge.mainGrid[`row${index}`].clip);
                        updateUI();
                        
                    }
                    break;
            
                case "arranger":
                    
                    break;
            
                case "clip":
                    
                    break;
            
                default:
                    break;
            }
        });
    });

    // Example: Add click listeners to performanceButtons
    deluge.performanceButtons.forEach((button, index) => {
        deluge.allButtons.push(button);
        button.addEventListener("click", () => {
            console.log(`Performance button ${index + 1} clicked.`);
            // Add additional functionality here
        });
    });

    // Example: Add click listeners to clipTypeButtons
    deluge.clipTypeButtons.forEach((button, index) => {
        deluge.allButtons.push(button);
        button.addEventListener("click", () => {
            console.log(`Clip type button ${index + 1} clicked.`);
            console.log("Is this thing on?")
            // Add additional functionality here
            if (contextManager.currentContext == "clip") {
                
                switch (index) {
                    case 0:
                        contextManager.activeClip.cliptype = "synth";
                        updateUI();
                        break;
                        
                        case 1:
                        contextManager.activeClip.cliptype = "kit";
                        updateUI();
                        break;
                
                    case 2:
                        contextManager.activeClip.cliptype = "midi";
                        updateUI();
                        break;
                
                    case 3:
                        contextManager.activeClip.cliptype = "cv";
                        updateUI();
                        break;
                
                    default:
                        console.log("here")
                        break;
                }
            }
        });
    });


    //add clips to song mode
    //initial clip
    // deluge.mainGrid.row7.clip = true;
    


    deluge.allButtons.push(...deluge.mainGridPads);
    console.log("SVG controls initialized:", deluge);
    // console.log(deluge.mainGrid.children.length)
};

function initializeSongProject() {
    // Example of creating a new Clip object
    const clip0 = new Clip("synth", "blue", true);
    projectFile.projectClips.push(clip0);
    deluge.mainGrid.row7.clip = clip0;
    
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
    // recolorButton(deluge.songButton, "#959595");
    // recolorButton(deluge.clipButton, "#959595");
    // recolorButton(deluge.topButtons.keyboard, "#959595");
    for (var z = 0; z < deluge.allButtons.length; z++) {
        recolorButton(deluge.allButtons[z], "#959595")
    }

    // Clear any previous blinking intervals
    if (arrangerBlinkInterval) clearInterval(arrangerBlinkInterval);
    if (clipBlinkInterval) clearInterval(clipBlinkInterval);

    switch (contextManager.currentContext) {
        case "song":
            recolorButton(deluge.songButton, "#007cff"); // Song button stays lit
            if (contextManager.displayMode === "performance") {
                recolorButton(deluge.topButtons.keyboard, "#007cff");
            }
            //affect entire
            if (contextManager.songAffectEntire == true) {
                recolorButton(deluge.topButtons.affectEntire, "#ff6700")
            }

            //start adding clips
            for (var x = 0; x < 8; x++) {
                if(deluge.mainGrid[`row${x}`].clip){
                    //need to improve the color accuracy of these hex codes
                    //also add other section colors. probably store all section colors in an array to simplify switching through them
                    //add a "highestUsedSectionColor" to the context manager since it's not as simple as looping through all of them
                    //actually, should have a similar global constant to the context manager that's for the song project file. contextmanager should stay just about views / context
                    recolorButton(deluge.muteColumn[x], "#00ff00");
                    recolorButton(deluge.auditionColumn[x], deluge.mainGrid[`row${x}`].clip.section);

                }
            }

            //end song
            break;

        case "arranger":
            if (contextManager.displayMode === "performance") {
                recolorButton(deluge.topButtons.keyboard, "#007cff"); // Keyboard button lit in performance
            }
            // Always blink the song button in arranger mode
            let isSongBlue = false;
            arrangerBlinkInterval = setInterval(() => {
                isSongBlue = !isSongBlue;
                recolorButton(deluge.songButton, isSongBlue ? "#007cff" : "#959595");
            }, 500);

             //affect entire
             if (contextManager.songAffectEntire == true) {
                recolorButton(deluge.topButtons.affectEntire, "#ff6700")
            }

            //end arranger
            break;

        case "clip":
            //modes and views
            if (contextManager.displayMode === "keyboard") {
                recolorButton(deluge.topButtons.keyboard, "#007cff");
                if (contextManager.lastNonKeyboardView === "automation") {
                    // Keep clip button blinking if last view was automation
                    let isClipBlue = false;
                    clipBlinkInterval = setInterval(() => {
                        isClipBlue = !isClipBlue;
                        recolorButton(deluge.clipButton, isClipBlue ? "#007cff" : "#959595");
                    }, 500);
                } else {
                    recolorButton(deluge.clipButton, "#007cff");
                }
            } else if (contextManager.displayMode === "automation") {
                let isClipBlue = false;
                clipBlinkInterval = setInterval(() => {
                    isClipBlue = !isClipBlue;
                    recolorButton(deluge.clipButton, isClipBlue ? "#007cff" : "#959595");
                }, 500);
            } else {
                recolorButton(deluge.clipButton, "#007cff");
            }

            //affect entire
            //TD: remove "true" once the logic actually is present
            if (true || cliptype == "synth" || clip.affectEntire == true) {
                recolorButton(deluge.topButtons.affectEntire, "#ff6700")
            }

            //clip type
            switch (contextManager.activeClip.cliptype) {
                case "synth":
                    recolorButton(deluge.clipTypeButtons[0], "#ff1100")
                    break;
            
                case "kit":
                    recolorButton(deluge.clipTypeButtons[1], "#ff1100")
                    break;
            
                case "midi":
                    recolorButton(deluge.clipTypeButtons[2], "#ff1100")
                    break;
            
                case "cv":
                    recolorButton(deluge.clipTypeButtons[3], "#ff1100")
                    break;
            
                case "audio":
                    // recolorButton(deluge.clipTypeButtons[0], "#ff1100")
                    break;
            
                default:
                    break;
            }
            //end clip
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
// Song Functions
// =====================

// Function to cycle the section color to the next one
function changeSectionColor(clip) {
    const currentIndex = validSections.indexOf(clip.section);
    let nextIndex = (currentIndex + 1) % validSections.length;

    // Ensure the next section is within the allowed range
    if (nextIndex > highestUsedSectionIndex + 1) {
        nextIndex = 0; // Loop back to the start if we've reached the limit
    }

    // Set the new section
    clip.setSection(validSections[nextIndex]);
    console.log(`Section changed to: ${clip.section}`);
}

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
    } else if (button){
        button.style.fill = color;
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
    initializeSongProject();
    updateUI();
});//end on load
