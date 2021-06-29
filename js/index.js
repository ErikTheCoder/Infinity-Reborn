const E = (x) => { return new ExpantaNum(x) }

var lastUpdate = Date.now();

const PLAYER_DATA = {
    peaks: E(1),
    neutralWaves: E(0),
}

var player = PLAYER_DATA
var tab = ""
var temp = {}

function toTab(e) {
    console.log(1)
    tab = e
    document.getElementById(e).parentNode.querySelectorAll("#" + document.getElementById(e).parentNode.id + " > .view").forEach(function(element) {
        element.classList.add('hidden');
    });
    document.getElementById(e).classList.remove('hidden');
}

toTab('mainview');

function buyNeutralWave(){
    if(player.peaks.gte(temp.neutralWaveCost)){
        player.peaks = player.peaks.sub(temp.neutralWaveCost)
        player.neutralWaves = player.neutralWaves.add(1)
    }
}

function updateCosts(){
    temp.neutralWaveCost = E(2).pow(player.neutralWaves)
}

function updateDisplay(){
    document.getElementById('peaksAmount').innerHTML = "You have reached " + format(player.peaks, 1) + " peaks";
    document.getElementById('peaksGain').innerHTML = "Your wave is moving at " + format(temp.peaksGain, 1) + " m/s";
    document.getElementById('wavelength').innerHTML = "Your wavelength is " + format(temp.wavelength, 1) + " m";
    if (tab == "mainview") {
        document.getElementById('wavecosttextid').innerHTML = "Cost: " + format(temp.neutralWaveCost, 0);
        document.getElementById('firstwaveamount').innerHTML = "You have " + format(player.neutralWaves, 0) + " neutral waves";
    }
}

function productionLoop(diff){
    temp.wavelength = E(1);
    temp.speed = player.neutralWaves
    temp.peaksGain = temp.speed.div(temp.wavelength)
    player.peaks = player.peaks.add(temp.peaksGain.mul(diff/1000))
}

function format(ex, acc=3) {
    ex = E(ex)
    if (ex.isInfinite()) return 'Infinity'
    let e = ex.log10().floor()
    if (e.lt(9)) {
        if (e.lt(3)) {
            return ex.toFixed(acc)
        }
        return ex.floor().toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
        if (ex.gte("eeee9")) {
            let slog = ex.slog()
            return (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(3)) + "F" + format(slog.floor(), 0)
        }
        let m = ex.div(E(10).pow(e))
        return (e.log10().gte(9)?'':m.toFixed(3))+'e'+format(e,0)
    }
}

function loop(){
    diff = Date.now() - lastUpdate;
    lastUpdate = Date.now();

    updateCosts();
    productionLoop(diff);
    updateDisplay();
}

setInterval(loop, 20)