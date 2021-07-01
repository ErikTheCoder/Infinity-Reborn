function haveBuyable(id, x) { return player.upgrades[id] ? (player.upgrades[id][x] ? player.upgrades[id][x] : E(0)) : E(0) }
function includesUpgrade(id, x) { return player.upgrades[id] ? player.upgrades[id].includes(x) : false }

const NU_UPGRADES = {
    can(x) { return player.neutralWaves.gte(this[x].cost()) && (x == 4 ? haveBuyable("neutral_wave",4).lt(1) && !player.heat_wave.unl : true) },
    buy(x) {
        let cost = this[x].cost()
        if (this.can(x)) {
            player.neutralWaves = player.neutralWaves.sub(cost).max(1)
            if (player.upgrades.neutral_wave[x] === undefined) player.upgrades.neutral_wave[x] = E(0)
            player.upgrades.neutral_wave[x] = player.upgrades.neutral_wave[x].add(1)
            if (x == 4) player.heat_wave.unl = true
        }
    },
    length: 4,
    1: {
        id: 1,
        desc: "Neutral Wave multiplies itself by 1.5x.",
        cost(x=haveBuyable("neutral_wave", this.id)) { return E(1.25).pow(x).mul(5).floor() },
        effect(x=haveBuyable("neutral_wave", this.id)) {
            let power = HEATWAVE.effect(1).nu.div(HEATWAVE.effect(0).nu)
            let ret = E(0.5).mul(power).add(1).pow(x)
            return ret
        },
        effDesc(x=this.effect()) { return format(x,2)+"x" },
    },
    2: {
        id: 2,
        desc: "Make Neutral Wave cost scaling is 5% weaker.",
        cost(x=haveBuyable("neutral_wave", this.id)) { return E(1.5).pow(x.pow(1.1)).mul(5).floor() },
        effect(x=haveBuyable("neutral_wave", this.id)) {
            let power = HEATWAVE.effect(1).nu.div(HEATWAVE.effect(0).nu)
            x = x.mul(power)
            if (x.gte(6)) x = x.div(6).pow(1/3).mul(6)
            let ret = E(0.95).pow(x).mul(2)
            return ret.max(1.4)
        },
        effDesc(x=this.effect()) { return "2x -> "+format(x,2)+"x"+(x.lte(1.4)?" (hardcapped)":"") },
    },
    3: {
        id: 3,
        desc: "Neutral Waves get a boost based on how many you have.",
        cost(x=haveBuyable("neutral_wave", this.id)) { return E(1.5).pow(x).mul(5).floor() },
        effect(x=haveBuyable("neutral_wave", this.id)) {
            let power = HEATWAVE.effect(1).nu.div(HEATWAVE.effect(0).nu)
            if (x.gte(5)) x = x.div(5).pow(1/3).mul(5)
            let ret = temp.totalNW ? temp.totalNW.add(1).log10().add(1).pow(x.pow(3/4)).pow(power) : E(1)
            return ret
        },
        effDesc(x=this.effect()) { return format(x,2)+"x" },
    },
    4: {
        id: 4,
        desc: "Unlock Heat Wave.",
        cost() { return E(30) },
        effDesc() { return haveBuyable("neutral_wave",4).gte(1)?"Unlocked":"Locked" },
    },
}

const HW_UPGRADES = {
    general: {
        can(x) { return temp.heat_wave.unspentAmount.gte(this[x].cost) && !includesUpgrade("heat_wave", x) && (x == 5 ? !player.sound_wave.unl : true) },
        buy(x) { if (this.can(x)) {
            player.upgrades.heat_wave.push(x)
            if (x == 5) player.sound_wave.unl = true
        } },
        length: 5,
        1: {
            desc: "Increases heat wave effect by 25%.",
            cost: E(2),
        },
        2: {
            desc: "Heat wave scaling is divided by neutral waves at a reduced rate.",
            cost: E(3),
            effect() {
                let ret = temp.totalNW ? temp.totalNW.add(1).log10().add(1).pow(1/4) : E(1)
                if (ret.gte(1.5)) ret = ret.div(1.5).pow(0.5).mul(1.5)
                return ret
            },
            effDesc(x=this.effect()) { return "/"+format(x,2)+(x.gte(1.5)?" (softcapped)":"") },
        },
        3: {
            desc: "Heat wave boost peaks gain.",
            cost: E(4),
            effect() {
                let ret = player.heat_wave.total.add(1)
                return ret
            },
            effDesc(x=this.effect()) { return format(x,2)+"x" },
        },
        4: {
            desc: "Wavelength divides heat wave scaling.",
            cost: E(4),
            effect() {
                let ret = temp.wavelength ? temp.wavelength.add(1).log10().add(1).log10().add(1).pow(1/4) : E(1)
                if (ret.gte(1.2)) ret = ret.div(1.2).pow(0.5).mul(1.2)
                return ret
            },
            effDesc(x=this.effect()) { return "/"+format(x,2)+(x.gte(1.2)?" (softcapped)":"") },
        },
        5: {
            desc: "Unlock Sound Waves.",
            cost: E(5),
        },
    },
    energy: {
        can(type, x) { return player.heat_wave.types[type].gte(this[HEATWAVE.type[type]][x].cost) && !includesUpgrade(HEATWAVE.type[type]+"_energy", x) },
        buy(type, x) {
            let t = HEATWAVE.type[type]
            let cost = this[t][x].cost
            if (this.can(type, x)) {
                player.heat_wave.types[type] = player.heat_wave.types[type].sub(cost)
                player.upgrades[t+"_energy"].push(x)
            }
        },
        cold: {
            length: 4,
            1: {
                desc: "Cold energy buff is 25% stronger.",
                cost: E(500),
            },
            2: {
                desc: "Hot energy gain is twice faster.",
                cost: E(1000),
            },
            3: {
                desc: "Cold energy gain is twice faster.",
                cost: E(5000),
            },
            4: {
                desc: "Neutral wave cost scaling is 10% weaker.",
                cost: E(25000),
            },
        },
        hot: {
            length: 4,
            1: {
                desc: "Hot energy buff is 25% stronger.",
                cost: E(500),
            },
            2: {
                desc: "Hot energy buff is 25% more stronger.",
                cost: E(1000),
            },
            3: {
                desc: "Hot energy gain is boosted by total heat wave.",
                cost: E(5000),
                effect() {
                    let ret = E(1.1).pow(player.heat_wave.total)
                    return ret
                },
                effDesc(x=this.effect()) { return format(x,2)+"x" },
            },
            4: {
                desc: "Hot energy debuff is 10% weaker.",
                cost: E(25000),
            },
        },
    }
}

const SW_UPGRADES = {
    buys: {
        can(x) { return player.sound_wave.points.gte(this[x].cost()) },
        buy(x) {
            let cost = this[x].cost()
            if (this.can(x)) {
                player.sound_wave.points = player.sound_wave.points.sub(cost)
                if (player.upgrades.sound_wave_buys[x] === undefined) player.upgrades.sound_wave_buys[x] = E(0)
                player.upgrades.sound_wave_buys[x] = player.upgrades.sound_wave_buys[x].add(1)
            }
        },
        length: 1,
        1: {
            id: 1,
            desc: "Multiples sound wave effect. (based on total sound waves)",
            cost(x=haveBuyable("sound_wave_buys",this.id)) { return x.add(1) },
            effect(x=haveBuyable("sound_wave_buys",this.id)) {
                let base = player.sound_wave.total.add(1).log10().add(1)
                let ret = base.pow(x)
                return ret
            },
            effDesc(x=this.effect(),y=this.effect(haveBuyable("sound_wave_buys",this.id).add(1))) { return format(x,2)+"x -> "+format(y,2)+"x" },
        },
    },
}