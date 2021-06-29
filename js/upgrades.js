function haveBuyable(id, x) { return player.upgrades[id] ? (player.upgrades[id][x] ? player.upgrades[id][x] : E(0)) : E(0) }
function includesUpgrade(id, x) { return player.upgrades[id] ? player.upgrades[id].includes(x) : false }

const NU_UPGRADES = {
    can(x) { return player.neutralWaves.gte(this[x].cost()) && (x == 4 ? !haveBuyable("neutral_wave",4).lt(1) : true) },
    buy(x) {
        let cost = this[x].cost()
        if (this.can(x)) {
            player.neutralWaves = player.neutralWaves.sub(cost).max(1)
            if (player.upgrades.neutral_wave[x] === undefined) player.upgrades.neutral_wave[x] = E(0)
            player.upgrades.neutral_wave[x] = player.upgrades.neutral_wave[x].add(1)
        }
    },
    length: 4,
    1: {
        id: 1,
        desc: "Neutral Wave multiplies itself by 1.5x.",
        cost(x=haveBuyable("neutral_wave", this.id)) { return E(1.25).pow(x).mul(5).floor() },
        effect(x=haveBuyable("neutral_wave", this.id)) {
            let ret = E(1.5).pow(x)
            return ret
        },
        effDesc(x=this.effect()) { return format(x,2)+"x" },
    },
    2: {
        id: 2,
        desc: "Make Neutral Wave cost scaled is 5% weaker.",
        cost(x=haveBuyable("neutral_wave", this.id)) { return E(1.5).pow(x.pow(1.1)).mul(5).floor() },
        effect(x=haveBuyable("neutral_wave", this.id)) {
            let ret = E(0.95).pow(x).mul(2)
            return ret
        },
        effDesc(x=this.effect()) { return "2x -> "+format(x,2)+"x" },
    },
    3: {
        id: 3,
        desc: "Neutral Waves get a boost based on how many you have.",
        cost(x=haveBuyable("neutral_wave", this.id)) { return E(1.5).pow(x).mul(5).floor() },
        effect(x=haveBuyable("neutral_wave", this.id)) {
            if (x.gte(5)) x = x.div(5).pow(0.5).mul(5)
            let ret = player.neutralWaves.add(1).log10().add(1).pow(x.pow(3/4))
            return ret
        },
        effDesc(x=this.effect()) { return format(x,2)+"x" },
    },
    4: {
        id: 4,
        desc: "Unlock Heat Wave <b>(Not Presented)</b>.",
        cost() { return E(30) },
        effDesc() { return haveBuyable("neutral_wave",4).gte(1)?"Unlocked":"Locked" },
    },
}