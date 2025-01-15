// =====================
// Global Configuration
// =====================
var lg = (msg) => console.log(msg);


// Example scales with offsets
const scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],

    // Western Modes
    // ionian: [0, 2, 4, 5, 7, 9, 11],        // Major scale
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    // aeolian: [0, 2, 3, 5, 7, 8, 10],       // Natural minor
    locrian: [0, 1, 3, 5, 6, 8, 10],

    // Minor Scales
    melodicMinor: [0, 2, 3, 5, 7, 9, 11],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    hungarianMinor: [0, 2, 3, 6, 7, 8, 11],

    // Other Scales
    marva: [0, 1, 4, 6, 7, 8, 11],
    arabian: [0, 2, 4, 5, 6, 8, 10],
    wholeTone: [0, 2, 4, 6, 8, 10],
    blues: [0, 3, 5, 6, 7, 10],
    pentatonicMinor: [0, 3, 5, 7, 10],
    hirajoshi: [0, 2, 3, 7, 8],

};

//actually, should have a similar global constant to the context manager that's for the song project file. contextmanager should stay just about views / context
const projectFile = {
    scale: scales.major,
    rootNote: "C-2",
    projectClips: [],
    activePerformanceButton: 1,
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
//TD: A bunch of things from the contextManager need to be moved into the clip object, since each clip will remember independently what its last view was. 
//These two at least:
// lastClipSubView: "default", // Tracks last clip sub-view
// lastNonKeyboardView: "default", // Tracks the last non-keyboard clip view
//I think many of the places that currently check, say, contextManager.lastNonKeyboardView can just check contextManager.activeClip.lastNonKBV etc
function Clip(clipType, section, scaleMode) {
    this.clipType = clipType;
    this.bars = 1;
    this.scaleMode = scaleMode;
    this.activePerformanceButton = 1;
    this.notes = {};
    this.setSection(section);
    this.mutedRows = [];
    this.preset = "";
    if (this.clipType == "synth") {
        this.affectEntire = true;
    } else {
        //TD: check if Midi + CV have affect entire and what is default
        this.affectEntire = false;
        
    }
    this.randomColorOffset = Math.floor(Math.random() * 24)*15;

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
//TD: This doesn't currently work, as a clip uses itself as a baseline. Need for loop to check at time of change, I think. 
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
        } else if (false && contextManager.currentContext === "clip" && clipType === "kit") {
            //TD: remove the false once kit clips are implemented
            //kit.affectEntire = false or somethinglike that
        }
    });

    /// ====== SCALE BUTTON =========
    deluge.allButtons.push(deluge.topButtons.scaleButton = delugeSvgDoc.querySelector("#scale"));
    deluge.topButtons.scaleButton.addEventListener("click", () => {
        if (contextManager.currentContext === "clip" && ["synth","midi","cv"].includes(contextManager.activeClip.clipType)) {
            contextManager.activeClip.scaleMode = !contextManager.activeClip.scaleMode;
            updateUI();
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
            switch (contextManager.currentContext) {
                case "song":
                    
                    break;
                case "arranger":
                
                break;
            
                case "clip":
                    let isMutedIdx = contextManager.activeClip.mutedRows.indexOf(index);
                    if (isMutedIdx == -1) {
                        contextManager.activeClip.mutedRows.push(index);
                        
                    } else {
                        contextManager.activeClip.mutedRows.splice(isMutedIdx,1)
                    }
                    updateUI();
                    break;
            
                default:
                    break;
            }
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
                        //TD: I think I need a for loop here to check at click time what's the highest used section
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
            switch (contextManager.currentContext) {
                case "song":
                    
                    break;
            
                case "arranger":
                    
                    break;
            
                case "clip":
                    contextManager.activeClip.activePerformanceButton = index;
                    updateUI();
                    break;
            
                default:
                    break;
            }
        });
    });

    // Example: Add click listeners to clipTypeButtons
    deluge.clipTypeButtons.forEach((button, index) => {
        deluge.allButtons.push(button);
        button.addEventListener("click", () => {
            console.log(`Clip type button ${index + 1} clicked.`);
            // Add additional functionality here
            if (contextManager.currentContext == "clip") {
                
                switch (index) {
                    case 0:
                        contextManager.activeClip.clipType = "synth";
                        updateUI();
                        break;
                        
                        case 1:
                        contextManager.activeClip.clipType = "kit";
                        updateUI();
                        break;
                
                    case 2:
                        contextManager.activeClip.clipType = "midi";
                        updateUI();
                        break;
                
                    case 3:
                        contextManager.activeClip.clipType = "cv";
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
    clip0.randomColorOffset = 300;
    projectFile.projectClips.push(clip0);
    deluge.mainGrid.row7.clip = clip0;
    contextManager.activeClip = clip0;
    
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
                    //TD:
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
                if (["synth","midi","cv"].includes(contextManager.activeClip.clipType)) {
                    isomorphicKeyboard();
                    
                } else if(contextManager.activeClip.clipType == "kit") {
                    //
                }
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
                //default notes view
                recolorButton(deluge.clipButton, "#007cff");

                //add mute column
                deluge.muteColumn.forEach((button, index) => {
                    if (contextManager.activeClip.mutedRows.includes(index)) {
                        // Set muted row color to yellow
                        recolorButton(button,"yellow");
                    } else {
                        // Set default color to green
                        recolorButton(button,"green");
                    }
                });
            }

            //scale button
            if (contextManager.activeClip.scaleMode && ["synth","midi","cv"].includes(contextManager.activeClip.clipType)) {
                recolorButton(deluge.topButtons.scaleButton, "#007cff");

            }
            //affect entire
            //TD: remove "true" once the logic actually is present
            if (true || contextManager.activeClip.clipType == "synth" || contextManager.activeClip.affectEntire == true) {
                recolorButton(deluge.topButtons.affectEntire, "#ff6700")
            }

            //performance buttons
            recolorButton(deluge.performanceButtons[contextManager.activeClip.activePerformanceButton], "#ff6700")

            //clip type
            switch (contextManager.activeClip.clipType.toString()) {
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
                    console.log("in clipType default " + contextManager.activeClip.clipType)
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
// UI Functions
// =====================

function getNoteHue(noteNum) {
    return contextManager.activeClip.randomColorOffset - (noteNum * 5);
}

function isomorphicKeyboard() {
    //starting point should be c-2
    //find color of c-2 and calculate from there
    //separate function that generates colors to use for root notes in non keyboard view
    //should also separate out notes to a separate function so other things can access the inkey notes, roots, etc
    var startingPoint = 300;//DONT USE THIS
    var isomorphicOffset = 5;
    var horzOffset = 2 //This is because by default the bottom leftmost pad is D2
    var vertOffset = 10; //for scrolling vertically
    var lightness;
    var saturation;
    var noteNumber = vertOffset * isomorphicOffset;

    // Get the active scale and root note from the clip
    const activeScale = projectFile.scale;
    const rootNote =  0;
    // const rootNote = activeClip.rootNote || 0;

    //scroll the grid
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 16; col++) {
            //reset values
            lightness = 58.4;
            saturation = 60;
            // Calculate the note index with the row isomorphicOffset
            // const noteIndex = (col + rootNote + horzOffset + vertOffset + row * Math.abs(isomorphicOffset)) % 12;
            const noteIndex = (noteNumber) % 12;
            lg(`Row: ${row}. Col: ${col}. NoteNumber: ${noteNumber}`)

            // Check if the note is in the active scale
            const isInScale = contextManager.activeClip.scaleMode == true ? activeScale.includes(noteIndex) : false;
            // const isRoot = noteIndex == rootNote;

            // Set color based on whether the note is in the scale
            saturation = isInScale ? 60 : 0;
            if (noteIndex == rootNote) {
                //if is root note
                lightness = 62;
                saturation = 100;
            }
            //TD: note index should work with scroll due to vertOffset. Need to figure out where to add that here. 
            // Also Horz offset too actually. It's sort of included with starting point, maybe should start from whatever the lowest note possible is and count up? 
            // deluge.mainGrid["row" + row]['pad' + col].style.fill = HSLToHex(startingPoint - (col * 5), saturation, lightness);
            deluge.mainGrid["row" + row]['pad' + col].style.fill = HSLToHex(getNoteHue(noteNumber), saturation, lightness);
            noteNumber++;
        }
        noteNumber-= (16-isomorphicOffset);
        startingPoint += 5 * isomorphicOffset;
    }
}

// =====================
// Utility Functions
// =====================

function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function HSLToHex(h,s,l) {
    // Normalize hue to be within [0, 359] using a while loop
    while (h < 0) h += 360;
    while (h >= 360) h -= 360;

    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
  
    // Prepend 0s, if necessary
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
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
