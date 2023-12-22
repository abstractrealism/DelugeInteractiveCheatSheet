// console.log()

var lg = (msg) => console.log(msg);


window.addEventListener('load', function() {
    // console.log('document - DOMContentLoaded - bubble'); // 2nd
    lg("working")
    var svgDoc = document.querySelector("#testGrid").contentDocument;
    var groups = svgDoc.querySelectorAll("svg > g");

    try {
        const testButton = document.getElementById("testButton");
        testButton.addEventListener('click', testing);
        
    } catch (error) {
        lg("error:" + error)
    }



    function testing() {
        
        console.log(groups.length);
        for (var z = 0; z < groups.length; z++) {
            groups[z].children[0].setAttribute('fill', 'purple');
        }
        
        // var bob = svgDoc.getElementById('bob');
        // bob.children[0].setAttribute('fill', 'green');
    }
});//end on load
  

function setRandomColor(target) {
    var randomColor = Math.floor(Math.random()*16777215).toString(16)
    target.color = randomColor;
}
