// console.log()

var lg = (msg) => console.log(msg);

var presets = {};

presets['presetA'] = new TestPreset('#aa23b0', '#19380a', '#56b390', '#808080')


window.addEventListener('load', function() {
    // console.log('document - DOMContentLoaded - bubble'); // 2nd
    // lg("working")
    var svgDoc = document.querySelector("#testGrid").contentDocument;
    var groups = svgDoc.querySelectorAll("svg > g");
    
    try {
        const testButton = document.getElementById("testButton");
        testButton.addEventListener('click', testing);
        
    } catch (error) {
        lg("error:" + error)
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
        
        // var bob = svgDoc.getElementById('bob');
        // bob.children[0].setAttribute('fill', 'green');
    }

    function applyPreset(targetID) {
        var presetToApply = presets[targetID];
        groups[0].children[0].setAttribute('fill', presetToApply.tl);
        groups[1].children[0].setAttribute('fill', presetToApply.tr);
        groups[2].children[0].setAttribute('fill', presetToApply.bl);
        groups[3].children[0].setAttribute('fill', presetToApply.br);
        
    }
});//end on load

  
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
