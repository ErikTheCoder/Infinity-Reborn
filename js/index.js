var lastUpdate = Date.now();
var player
var tab = ""
var temp = {}

function setupElement() {
  temp.el = {}
	let all = document.getElementsByTagName("*")
  console.log(all)
	for (let i=0;i<all.length;i++) {
		let x = all[i]
		temp.el[x.id] = new Element(x)
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

function toggleTab(id) {
  player.toggle_show[id] = !player.toggle_show[id]
}

function buyNeutralWave() {
    let cost = temp.neutralWaveCost;
    if (player.peaks.gte(cost)) {
        player.peaks = player.peaks.sub(cost);
        player.neutralWaves = player.neutralWaves.add(1);
    }
}

function updateCosts(){
    temp.neutralWaveCostBase = E(2)
    if (haveBuyable('neutral_wave',2).gte(1)) temp.neutralWaveCostBase = NU_UPGRADES[2].effect()
    if (includesUpgrade("cold_energy", 4)) temp.neutralWaveCostBase = temp.neutralWaveCostBase.sub(1).mul(0.9).add(1)
    temp.neutralWaveCost = temp.neutralWaveCostBase.pow(player.neutralWaves)
}

function updateDisplay(){
    temp.el.peaksAmount.setTxt("You have reached " + format(player.peaks, 1) + " peaks");
    temp.el.peaksGain.setTxt("Your wave is moving at " + format(temp.peaksGain, 1) + " m/s");
    temp.el.wavelength.setTxt("Your wavelength is " + format(temp.wavelengthdisplay, 6) + " m");
    if (tab == "mainview") {
        temp.el.firstwaveamount.setTxt("You have " + format(player.neutralWaves, 0) + " neutral waves, which multiples peaks gain by "+format(temp.neutralWaveEffect,1)+"x");
        if (player.toggle_show.neutral_wave_tab) {
            temp.el.wavecosttextid.setHTML("Cost: " + format(temp.neutralWaveCost, 0));
            for (let x = 1; x <= NU_UPGRADES.length; x++) {
                temp.el["nu_upg"+x].setHTML(`${NU_UPGRADES[x].desc}<br>
                Level: ${format(haveBuyable("neutral_wave", x), 0)}<br>
                ${NU_UPGRADES[x].effDesc?"Currently: "+NU_UPGRADES[x].effDesc()+"<br>":""}
                Cost: ${format(NU_UPGRADES[x].cost(), 0)} Neutral Waves`)

                temp.el["nu_upg"+x].setClasses({"upgrade": true, 'can': NU_UPGRADES.can(x)})
            }
        }
        temp.el.heat_wave_unl.setClasses({"hidden": !(player.heat_wave.unl || haveBuyable("neutral_wave",4).gte(1))})

        if (player.toggle_show.heat_wave_tab) updateHeatWaveDisplay()
    }
    for (let x = 0; x < Object.keys(PLAYER_DATA.toggle_show).length; x++) {
        let key = Object.keys(PLAYER_DATA.toggle_show)[x]
        temp.el[key].setClasses({"hidden": !player.toggle_show[key]})
        temp.el["toggle_"+key].setTxt(player.toggle_show[key]?"▲":"▼")
    }
}

function updateNWEffect() {
    temp.neutralWaveEffect = player.neutralWaves
    if (haveBuyable('neutral_wave',1).gte(1)) temp.neutralWaveEffect = temp.neutralWaveEffect.mul(NU_UPGRADES[1].effect())
    if (haveBuyable('neutral_wave',3).gte(1)) temp.neutralWaveEffect = temp.neutralWaveEffect.mul(NU_UPGRADES[3].effect())
}

function productionLoop(diff){
    temp.wavelength = E(1);

    if (player.heat_wave.unl) temp.wavelength = temp.wavelength.mul(temp.heat_wave.effect)
    temp.wavelength = temp.wavelength.mul(HEATWAVE.effect(0).wave)
    temp.wavelength = temp.wavelength.div(HEATWAVE.effect(1).wave)

    temp.wavelengthdisplay = E(1).div(temp.wavelength)
    
    temp.speed = temp.neutralWaveEffect
    temp.speed = temp.speed.mul(HEATWAVE.effect(0).speed)
    temp.speed = temp.speed.div(HEATWAVE.effect(1).speed)

    temp.peaksGain = temp.speed.mul(temp.wavelength)
    if (includesUpgrade("heat_wave", 3)) temp.peaksGain = temp.peaksGain.mul(HW_UPGRADES.general[3].effect())
    player.peaks = player.peaks.add(temp.peaksGain.mul(diff/1000))

    if (player.heat_wave.unl) {
      for (let x = 0; x < 2; x++) player.heat_wave.types[x] = player.heat_wave.types[x].add(HEATWAVE.energyGain(x).mul(diff/1000))
    }
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

    updateHeatWave()
    updateCosts();
    updateNWEffect()
    productionLoop(diff);
    updateDisplay();
}
