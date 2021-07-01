function E(x){return new ExpantaNum(x)};
function ex(x){
    let nx = new E(0);
    nx.array = x.array;
    nx.sign = x.sign;
    nx.layer = x.layer;
    return nx;
}

const PLAYER_DATA = {
    peaks: E(1),
    neutralWaves: E(0),
    freeNeutralWaves: E(0),
    echo: {
        unl: [],
        activate: {},
    },
    upgrades: {
        neutral_wave: {},
        heat_wave: [],
        cold_energy: [],
        hot_energy: [],
        sound_wave_buys: {},
    },
    toggle_show: {
        neutral_wave_tab: true,
        heat_wave_tab: true,
        sound_wave_tab: true,
    },
    heat_wave: {
        unl: false,
        total: E(0),
        slider: E(0),
        types: [E(0), E(0)],
    },
    sound_wave: {
        unl: false,
        total: E(0),
        points: E(0),
        burst_cooldown: 0,
        burst_activated: false,
    },
}

function wipe() {
    player = PLAYER_DATA
}

function loadPlayer(load) {
    player = load
    checkIfUndefined()
    convertToExpNum()
}

function checkIfUndefined() {
    for (let x = 0; x < Object.keys(PLAYER_DATA).length; x++) {
        let key = Object.keys(PLAYER_DATA)[x]
        if (player[key] === undefined) player[key] = PLAYER_DATA[key]
    }
    for (let x = 0; x < Object.keys(PLAYER_DATA.upgrades).length; x++) {
        let key = Object.keys(PLAYER_DATA.upgrades)[x]
        if (player.upgrades[key] === undefined) player.upgrades[key] = PLAYER_DATA.upgrades[key]
    }
    for (let x = 0; x < Object.keys(PLAYER_DATA.toggle_show).length; x++) {
        let key = Object.keys(PLAYER_DATA.toggle_show)[x]
        if (player.toggle_show[key] === undefined) player.toggle_show[key] = PLAYER_DATA.toggle_show[key]
    }
    for (let x = 0; x < Object.keys(PLAYER_DATA.heat_wave).length; x++) {
        let key = Object.keys(PLAYER_DATA.heat_wave)[x]
        if (player.heat_wave[key] === undefined) player.heat_wave[key] = PLAYER_DATA.heat_wave[key]
    }
    for (let x = 0; x < Object.keys(PLAYER_DATA.sound_wave).length; x++) {
        let key = Object.keys(PLAYER_DATA.sound_wave)[x]
        if (player.sound_wave[key] === undefined) player.sound_wave[key] = PLAYER_DATA.sound_wave[key]
    }
    for (let x = 0; x < Object.keys(PLAYER_DATA.echo).length; x++) {
        let key = Object.keys(PLAYER_DATA.echo)[x]
        if (player.echo[key] === undefined) player.echo[key] = PLAYER_DATA.echo[key]
    }
}

function convertToExpNum() {
    player.peaks = ex(player.peaks)
    player.neutralWaves = ex(player.neutralWaves)
    player.freeNeutralWaves = ex(player.freeNeutralWaves)
    for (let x = 1; x <= NU_UPGRADES.length; x++) if (player.upgrades.neutral_wave[x] !== undefined) player.upgrades.neutral_wave[x] = ex(player.upgrades.neutral_wave[x])
    for (let x = 1; x <= SW_UPGRADES.buys.length; x++) if (player.upgrades.sound_wave_buys[x] !== undefined) player.upgrades.sound_wave_buys[x] = ex(player.upgrades.sound_wave_buys[x])

    player.heat_wave.total = ex(player.heat_wave.total)
    player.heat_wave.slider = ex(player.heat_wave.slider)
    for (let x = 0; x < 2; x++) player.heat_wave.types[x] = player.heat_wave.types[x] !== undefined ? ex(player.heat_wave.types[x]) : E(0)

    player.sound_wave.total = ex(player.sound_wave.total)
    player.sound_wave.points = ex(player.sound_wave.points)
}

function save(){
    if (localStorage.getItem("InfRebornSave") == '') wipe()
    localStorage.setItem("InfRebornSave",btoa(JSON.stringify(player)))
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    save();
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Inf-Reborn Save.txt"
    a.click()
}

function importy() {
    let loadgame = prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")
    if (loadgame != null) {
        load(loadgame)
    }
}

function onLoad() {
    wipe()
    load(localStorage.getItem("InfRebornSave"))
    setInterval(save,1000)
    temp = {}
    setupElement()
    setInterval(loop, 50)
}