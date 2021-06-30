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
    upgrades: {
        neutral_wave: {},
        heat_wave: [],
        cold_energy: [],
        hot_energy: [],
    },
    toggle_show: {
        neutral_wave_tab: true,
        heat_wave_tab: true,
    },
    heat_wave: {
        unl: false,
        total: E(0),
        slider: E(0),
        types: [E(0), E(0)],
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
}

function convertToExpNum() {
    player.peaks = ex(player.peaks)
    player.neutralWaves = ex(player.neutralWaves)
    for (let x = 1; x <= NU_UPGRADES.length; x++) if (player.upgrades.neutral_wave[x] !== undefined) player.upgrades.neutral_wave[x] = ex(player.upgrades.neutral_wave[x])

    player.heat_wave.total = ex(player.heat_wave.total)
    player.heat_wave.slider = ex(player.heat_wave.slider)
    for (let x = 0; x < 2; x++) player.heat_wave.types[x] = player.heat_wave.types[x] !== undefined ? ex(player.heat_wave.types[x]) : E(0)
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
    setupElement()
    setInterval(loop, 50)
}