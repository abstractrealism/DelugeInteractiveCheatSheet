// console.log()

var lg = (msg) => console.log(msg);

var presets = {};

var deluge = {};


presets['presetA'] = new TestPreset('#aa23b0', '#19380a', '#56b390', '#808080')


window.addEventListener('load', function() {
    // console.log('document - DOMContentLoaded - bubble'); // 2nd
    // lg("working")
    // //test doc:
    // var svgDoc = document.querySelector("#testGrid").contentDocument;
    // var groups = svgDoc.querySelectorAll("svg > g");
    //
      //  
        // try {
        //     const testButton = document.getElementById("testButton");
        //     testButton.addEventListener('click', testing);
            
        // } catch (error) {
        //     lg("error:" + error)
        // }

    // deluge:
    // var groups = svgDoc.querySelectorAll("svg > g");
    // lg(delugeSvgDoc.querySelector('#mainGrid').children[0].children[0].children[0].tagName);
    
    // lg(deluge.mainGrid.children.length)
    
    ///////DELUGE OBJECT SET UP//////
    var delugeSvgDoc = document.querySelector("#delugeSVG").contentDocument;
    
    //MAIN GRID
    deluge.mainGrid = delugeSvgDoc.querySelector('#mainGrid');
    for (var x = 0; x < deluge.mainGrid.children.length; x++) {
        deluge.mainGrid['row' + x] = deluge.mainGrid.children[x];
        for (var y = 0; y < deluge.mainGrid['row' + x].children.length; y++) {
            deluge.mainGrid['row' + x]['pad' + y] = deluge.mainGrid['row' + x].children[y];
        }
    }

    try {
        // lg(deluge.mainGrid.row3.pad3.children[0])
        deluge.mainGrid.row4.pad4.children[0].style.fill = "#ff00ff";
        // deluge.mainGrid.row3.pad3.children[0].fill = "#ff0000";
        deluge.mainGrid.row2.pad2.children[0].setAttribute('fill', "#00ff00");

        // lg(deluge.mainGrid.row3.pad3.children[0].fill)
        // changeColor(deluge.mainGrid.row3.pad3.children[0], "#ff0000");
    } catch (error) {
        lg(error)
    }
    
    var presetDiv = document.getElementById('preset-div');
    presetDiv.addEventListener('click', function(event){
        applyPreset(event.target.id)
    });
    
    function testing() {
        
        for (var z = 0; z < groups.length; z++) {
            // groups[z].children[0].setAttribute('fill', 'purple');
            setRandomColor(groups[z].children[0]);
        }
        groups[3].style.visibility = "hidden";
        
        // var bob = svgDoc.getElementById('bob');
        // bob.children[0].setAttribute('fill', 'green');
    }

    function changeColor(button, color) {
        button.fill = color;
        lg("what's going on??")

    }

    function applyPreset(targetID) {
        var presetToApply = presets[targetID];
        groups[0].children[0].fill=  presetToApply.tl;
        groups[1].children[0].fill=  presetToApply.tr;
        groups[2].children[0].fill= presetToApply.bl;
        groups[3].children[0].fill= presetToApply.br;
        // groups[3].children[0].setAttribute('fill', presetToApply.br);
        
    }
});//end on load
/*

array per row
array each for mutes and auditions
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
  
function TestPreset(tl, tr, bl, br) {
    this.tl = tl;
    this.tr = tr;
    this.bl = bl;
    this.br = br;
}

function setRandomColor(target) {
    var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16)
    // target.color = randomColor;
    target.setAttribute('fill', randomColor);
}
