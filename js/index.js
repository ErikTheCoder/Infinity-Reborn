var peaks = 1;
var neutralWaves = 0;
var neutralWaveCost = 0;
var neutralWaveCostMult = 2;
var wavelength = 1;
var speed = 1;
var lastUpdate = Date.now();

function toTab(e) {
    console.log(1)
    document.getElementById(e).parentNode.querySelectorAll("#" + document.getElementById(e).parentNode.id + " > .view").forEach(function(element) {
        element.classList.add('hidden');
    });
    document.getElementById(e).classList.remove('hidden');
}

toTab('mainview');

function buyNeutralWave(){
    if(peaks >= neutralWaveCost){
        peaks -= neutralWaveCost;
        neutralWaves += 1;
    }
}

function updateCosts(){
    neutralWaveCost = neutralWaveCostMult**neutralWaves;
}

function updateDisplay(){
    document.getElementById('numberDisplay').innerHTML = "You have reached " + peaks.toFixed(2); + " peaks";
    document.getElementById('wavecosttextid').innerHTML = "Cost: " + neutralWaveCost;
    document.getElementById('firstwaveamount').innerHTML = "You have " + neutralWaves + " neutral waves"
}

function productionLoop(diff){
    speed = neutralWaves;
    peaks += (speed / wavelength) * (diff / 1000);
}


function loop(){
    diff = Date.now() - lastUpdate;
    lastUpdate = Date.now();

    updateCosts();
    updateDisplay();
    productionLoop(diff);
}

setInterval(loop, 20)