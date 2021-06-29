var lastUpdate = Date.now();
var player
var tab = ""
var temp = {}

function setupElement() {
    temp.el = {
        peaksAmount: document.getElementById('peaksAmount'),
        peaksGain: document.getElementById('peaksGain'),
        wavelength: document.getElementById('wavelength'),
        wavecosttextid: document.getElementById('wavecosttextid'),
        firstwaveamount: document.getElementById('firstwaveamount'),
    }
    for (let x = 1; x <= NU_UPGRADES.length; x++) {
        temp.el["nu_upg"+x] = document.getElementById('nu_upg'+x)
    }
}

function toTab(e) {
  console.log(1);
  tab = e;
  document
    .getElementById(e)
    .parentNode.querySelectorAll(
      "#" + document.getElementById(e).parentNode.id + " > .view"
    )
    .forEach(function (element) {
      element.classList.add("hidden");
    });
  document.getElementById(e).classList.remove("hidden");
}

toTab("mainview");

function buyNeutralWave() {
  let cost = getCosts();
  if (player.peaks.gte(cost)) {
    player.peaks = player.peaks.sub(cost);
    player.neutralWaves = player.neutralWaves.add(1);
  }
}

function updateCosts(){
    temp.neutralWaveCostBase = E(2)
    if (haveBuyable('neutral_wave',2).gte(1)) temp.neutralWaveCostBase = NU_UPGRADES[2].effect()
    temp.neutralWaveCost = temp.neutralWaveCostBase.pow(player.neutralWaves)
}

function updateDisplay(){
    temp.el.peaksAmount.innerHTML = "You have reached " + format(player.peaks, 1) + " peaks";
    temp.el.peaksGain.innerHTML = "Your wave is moving at " + format(temp.peaksGain, 1) + " m/s";
    temp.el.wavelength.innerHTML = "Your wavelength is " + format(temp.wavelength, 1) + " m";
    if (tab == "mainview") {
        temp.el.wavecosttextid.innerHTML = "Cost: " + format(temp.neutralWaveCost, 0);
        temp.el.firstwaveamount.innerHTML = "You have " + format(player.neutralWaves, 0) + " neutral waves, which multiples peaks gain by "+format(temp.neutralWaveEffect,1)+"x.";
        for (let x = 1; x <= NU_UPGRADES.length; x++) {
            temp.el["nu_upg"+x].innerHTML = `${NU_UPGRADES[x].desc}<br>
            Level: ${format(haveBuyable("neutral_wave", x), 0)}<br>
            ${NU_UPGRADES[x].effDesc?"Currently: "+NU_UPGRADES[x].effDesc()+"<br>":""}
            Cost: ${format(NU_UPGRADES[x].cost(), 0)} Neutral Waves`

            temp.el["nu_upg"+x].onclick = _ => { NU_UPGRADES.buy(x) }

            temp.el["nu_upg"+x].classList.add("can")
            if (!NU_UPGRADES.can(x)) temp.el["nu_upg"+x].classList.remove("can")
        }
    }
}

function updateNWEffect() {
    temp.neutralWaveEffect = player.neutralWaves
    if (haveBuyable('neutral_wave',1).gte(1)) temp.neutralWaveEffect = temp.neutralWaveEffect.mul(NU_UPGRADES[1].effect())
    if (haveBuyable('neutral_wave',3).gte(1)) temp.neutralWaveEffect = temp.neutralWaveEffect.mul(NU_UPGRADES[3].effect())
}

function productionLoop(diff){
    temp.wavelength = E(1);
    temp.speed = temp.neutralWaveEffect
    temp.peaksGain = temp.speed.div(temp.wavelength)
    player.peaks = player.peaks.add(temp.peaksGain.mul(diff/1000))
}

function format(ex, acc = 3) {
  ex = E(ex);
  if (ex.isInfinite()) return "Infinity";
  let e = ex.log10().floor();
  if (e.lt(9)) {
    if (e.lt(3)) {
      return ex.toFixed(acc);
    }
    return ex
      .floor()
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  } else {
    if (ex.gte("eeee9")) {
      let slog = ex.slog();
      return (
        (slog.gte(1e9) ? "" : E(10).pow(slog.sub(slog.floor())).toFixed(3)) +
        "F" +
        format(slog.floor(), 0)
      );
    }
    let m = ex.div(E(10).pow(e));
    return (e.log10().gte(9) ? "" : m.toFixed(3)) + "e" + format(e, 0);
  }
}

function loop() {
  diff = Date.now() - lastUpdate;
  lastUpdate = Date.now();

    updateCosts();
    updateNWEffect()
    productionLoop(diff);
    updateDisplay();
}
