const SOUND_WAVE = {
    gain() {
        let gain = player.heat_wave.total.sub(12).div(6)
        return gain.floor().max(0)
    },
    can() { return this.gain().gte(1) },
    effect(x=player.sound_wave.points) {
        let ret = x.mul(0.1)
        if (haveBuyable("sound_wave_buys", 1).gte(1)) ret = ret.mul(SW_UPGRADES.buys[1].effect())
        return ret
    },
    reset() {
        if (this.can()) {
            let gain = this.gain()
            player.sound_wave.points = player.sound_wave.points.add(gain)
            player.sound_wave.total = player.sound_wave.total.add(gain)
            player.sound_wave.unl = true
            this.doReset()
        }
    },
    doReset() {
        player.freeNeutralWaves = E(0)
        player.upgrades.heat_wave = []
        player.upgrades.hot_energy = []
        player.upgrades.cold_energy = []
        player.heat_wave.total = E(0)
        player.heat_wave.slider = E(0)
        player.heat_wave.types = [E(0), E(0)]
        doResetHeatWave()
    },

    barriers: {
        length: 2,
        reached(x) { return player.sound_wave.total.gte(this[x].req) },
        1: {
            desc: "Unlock Burst.",
            req: E(1),
        },
        2: {
            desc: "Unlock Echo<sup>1</sup> (Neutral Waves Autobuyer). Neutral Waves doesn't spent peaks.",
            req: E(5),
        },
    },

    burst: {
        canActivate() { return !player.burst_activated && player.sound_wave.burst_cooldown <= 0 },
        activate() {
            if (this.canActivate()) {
                player.burst_activated = true
                player.sound_wave.burst_cooldown = 5
            }
        },
        effect() {
            let ret = player.sound_wave.total.add(1).log10().add(1).mul(2)
            return ret
        },
    },
}

function updateSoundWaveDisplay() {
    temp.el.sound_wave_total.setTxt(format(player.sound_wave.total, 0))
    temp.el.sound_wave_gain.setTxt(format(SOUND_WAVE.gain(), 0))
    temp.el.sound_wave_power.setTxt(format(player.freeNeutralWaves, 2))

    temp.el.sound_wave_reset.setClasses({"prestige": true, 'can': SOUND_WAVE.can()})

    for (let x = 1; x <= SW_UPGRADES.buys.length; x++) {
        temp.el["sw_buy"+x].setHTML(`${SW_UPGRADES.buys[x].desc}<br>
        Level: ${format(haveBuyable("sound_wave_buys", x), 0)}<br>
        ${SW_UPGRADES.buys[x].effDesc?"Currently: "+SW_UPGRADES.buys[x].effDesc()+"<br>":""}
        Cost: ${format(SW_UPGRADES.buys[x].cost(), 0)} Sound Waves`)

        temp.el["sw_buy"+x].setClasses({"upgrade": true, "small": true, 'can': SW_UPGRADES.buys.can(x)})
    }

    for (let x = 1; x <= SOUND_WAVE.barriers.length; x++) {
        temp.el["sw_barrier"+x].setClasses({"barrier": true, "bought": SOUND_WAVE.barriers.reached(x)})
    }
}

function updateSoundWave() {
    if (!temp.sound_wave) temp.sound_wave = {}
    if (SOUND_WAVE.barriers.reached(2) && !player.echo.unl.includes(1)) player.echo.unl.push(1)
}

function SWLoop(dt) {
    if (player.sound_wave.unl) {
        player.freeNeutralWaves = player.freeNeutralWaves.add(SOUND_WAVE.effect().mul(dt/1000))
        if (player.burst_activated) {
            if (player.sound_wave.burst_cooldown - dt/1000 <= 0) {
                player.burst_activated = false
                player.sound_wave.burst_cooldown = 0
            } else player.sound_wave.burst_cooldown -= dt/1000
        }
    }
}

function setupBarrierTable() {
    let table = new Element("sw_barriers")
    let text = ""
    for (let x = 1; x <= SOUND_WAVE.barriers.length; x++) {
        let b = SOUND_WAVE.barriers[x]
        text += `<div class="barrier" id="sw_barrier${x}">
            <b>${format(b.req,0)} Sound Waves</b><br>${b.desc}
        </div>`
    }
    table.setHTML(text)
}