
window.onload = function () {
    window.electronAPI.onUuid((event, data) => {
        document.getElementById("code").innerHTML = data;
    })
}

function startShare() {
    try {
        window.electronAPI.sendStartShare();
        document.getElementById("start").style.display = "none";
        document.getElementById("stop").style.display = "block";
    } catch (err) {
        console.log(err);
    }
}

function stopShare() {
    window.electronAPI.sendStopShare();
    document.getElementById("stop").style.display = "none";
    document.getElementById("start").style.display = "block";
}