const HEATWAVE = {
    type: ['cold', 'hot'],
    getTypeForGain() { return [player.heat_wave.slider, player.heat_wave.total.sub(player.heat_wave.slider)] },
    makeSlider(n) { player.heat_wave.slider = player.heat_wave.slider.add(n).max(0).min(player.heat_wave.total) },
    energyGain(x) {
        let gain = E(2).pow(this.getTypeForGain()[x]).sub(1)
        if (x == 0) {
            if (includesUpgrade("cold_energy", 3)) gain = gain.mul(2)
        } else {
            if (includesUpgrade("cold_energy", 2)) gain = gain.mul(2)
            if (includesUpgrade("hot_energy", 3)) gain = gain.mul(HW_UPGRADES.energy.hot[3].effect())
        }
        return gain
    },
    effect(x) {
        let ret = {}
        let amount = player.heat_wave.types[x]
        let buff = [E(1), E(1)]
        let debuff = [E(1), E(1)]
        if (includesUpgrade(this.type[x]+"_energy", 1)) buff[x] = buff[x].mul(1.25)
        if (x == 0) {

        } else {
            if (includesUpgrade("hot_energy", 2)) buff[1] = buff[1].mul(1.25)
            if (includesUpgrade("hot_energy", 4)) debuff[1] = debuff[1].mul(0.9)
        }

        ret.wave = amount.add(1).pow(0.25).pow(buff[0])

        ret.speed = amount.add(1).pow(1/3).pow(buff[0])

        ret.nu = amount.add(1).log10().add(1).pow(1/4).pow(buff[1])

        return ret
    },
    effDesc: [
        (x=HEATWAVE.effect(0)) => { return `divides wavelength by <span class='cold'>${format(x.wave)}</span>, 
        multiples speed by <span class='cold'>${format(x.speed)}</span>, 
        make neutral upgrades is <span class='cold'>${format(x.nu.sub(1).mul(100))}%</span> weaker` },

        (x=HEATWAVE.effect(1)) => { return `multiples wavelength by <span class='hot'>${format(x.wave)}</span>, 
        divides speed by <span class='hot'>${format(x.speed)}</span>, 
        make neutral upgrades is <span class='hot'>${format(x.nu.sub(1).mul(100))}%</span> stronger` },
    ],
}

function updateHeatWaveDisplay() {
    temp.el.heat_wave_gain.setTxt(format(temp.heat_wave.gain, 0))
    temp.el.heat_wave_nextAt.setTxt(format(temp.heat_wave.nextAt, 0))

    temp.el.heat_wave_nextAt.setTxt(format(temp.heat_wave.nextAt, 0))

    temp.el.heat_wave_reset.setClasses({"prestige": true, 'can': canResetHeatWave()})

    temp.el.burst.setClasses({"upgrade": true, "small": true, "hidden": !SOUND_WAVE.barriers.reached(1), "can": SOUND_WAVE.burst.canActivate()})
    temp.el.burst.setHTML(
        `Activate Burst, which makes heat wave is ${format(SOUND_WAVE.burst.effect().sub(1).mul(100), 2)}% effective.${SOUND_WAVE.burst.effect().gte(6)?" (softcapped)":""}<br>
        Cooldown: ${format(player.sound_wave.burst_cooldown, 1)} s`
    )

    temp.el.heat_wave_unspentAmount.setTxt(format(temp.heat_wave.unspentAmount, 0))

    for (let x = 0; x < 2; x++) {
        let t = HEATWAVE.type[x]

        temp.el["heat_wave_"+t+"EnergyAmount"].setTxt(format(HEATWAVE.getTypeForGain()[x], 1))
        temp.el["heat_wave_"+t+"EnergyGain"].setTxt(format(HEATWAVE.energyGain(x), 1))
        temp.el["heat_wave_"+t+"EnergyPower"].setTxt(format(player.heat_wave.types[x], 1))
        temp.el["heat_wave_"+t+"EnergyEffect"].setHTML(HEATWAVE.effDesc[x]())

        for (let y = 1; y <= HW_UPGRADES.energy[t].length; y++) {
            temp.el[t+"u_upg"+y].setHTML(`${HW_UPGRADES.energy[t][y].desc}<br>
            ${HW_UPGRADES.energy[t][y].effDesc?"Currently: "+HW_UPGRADES.energy[t][y].effDesc()+"<br>":""}
            Cost: ${format(HW_UPGRADES.energy[t][y].cost, 0)} ${t} energy`)

            temp.el[t+"u_upg"+y].setClasses({"upgrade": true, "small": true, 'can': HW_UPGRADES.energy.can(x, y), 'bought': includesUpgrade(t+"_energy", y)})
        }
    }

    for (let x = 1; x <= HW_UPGRADES.general.length; x++) {
        temp.el["hw_upg"+x].setHTML(`${HW_UPGRADES.general[x].desc}<br>
        ${HW_UPGRADES.general[x].effDesc?"Currently: "+HW_UPGRADES.general[x].effDesc()+"<br>":""}
        Cost: ${format(HW_UPGRADES.general[x].cost, 0)} Heat Waves`)

        temp.el["hw_upg"+x].setClasses({"upgrade": true, "small": true, 'can': HW_UPGRADES.general.can(x), 'bought': includesUpgrade("heat_wave", x)})
    }
}

function getHeatWaveGain() {
    let gain = player.neutralWaves.sub(30).div(temp.heat_wave.base).sub(player.heat_wave.total)
    if (player.neutralWaves.lt(30)) return E(0)
    gain = gain.add(1)
    return gain.max(0).floor()
}

function getHeatWaveNextAt() {
    let ret = player.heat_wave.total.add(getHeatWaveGain()).mul(temp.heat_wave.base).add(30)
    return ret.floor()
}

function canResetHeatWave() { return getHeatWaveGain().gte(1) }

function resetHeatWave() {
    if (canResetHeatWave()) {
        player.heat_wave.total = player.heat_wave.total.add(getHeatWaveGain())
        player.heat_wave.unl = true
        doResetHeatWave()
    }
}

function doResetHeatWave() {
    player.peaks = E(1)
    player.neutralWaves = E(0)
    player.upgrades.neutral_wave = {}
}

function updateHeatWave() {
    if (!temp.heat_wave) temp.heat_wave = {}
    temp.heat_wave.base = E(5)
    if (includesUpgrade("heat_wave", 2)) temp.heat_wave.base = temp.heat_wave.base.div(HW_UPGRADES.general[2].effect())
    if (includesUpgrade("heat_wave", 4)) temp.heat_wave.base = temp.heat_wave.base.div(HW_UPGRADES.general[4].effect())

    temp.heat_wave.gain = getHeatWaveGain()
    temp.heat_wave.nextAt = getHeatWaveNextAt()
    temp.heat_wave.effect = player.heat_wave.total.add(1)
    if (includesUpgrade('heat_wave', 1)) temp.heat_wave.effect = temp.heat_wave.effect.mul(1.25)
    if (player.burst_activated) temp.heat_wave.effect = temp.heat_wave.effect.pow(SOUND_WAVE.burst.effect())

    temp.heat_wave.unspentAmount = player.heat_wave.total
    for (let x = 1; x <= HW_UPGRADES.general.length; x++) if (includesUpgrade('heat_wave', x)) temp.heat_wave.unspentAmount = temp.heat_wave.unspentAmount.sub(HW_UPGRADES.general[x].cost)
}