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
}

function convertToExpNum() {
    player.peaks = ex(player.peaks)
    player.neutralWaves = ex(player.neutralWaves)
    for (let x = 1; x <= NU_UPGRADES.length; x++) if (player.upgrades.neutral_wave[x] !== undefined) player.upgrades.neutral_wave[x] = ex(player.upgrades.neutral_wave[x])
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