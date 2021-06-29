
function toTab(e) {
    console.log(1)
    document.getElementById(e).parentNode.querySelectorAll("#" + document.getElementById(e).parentNode.id + " > .view").forEach(function(element) {
        element.classList.add('hidden');
    });
    document.getElementById(e).classList.remove('hidden');
}

toTab('mainview');