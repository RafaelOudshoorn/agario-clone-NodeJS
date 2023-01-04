let SocketServerClass = require("./SocketServer");

let ss = new SocketServerClass();

let userInfo = new Map();

const colors = [
    "blue",
    "lightblue",
    "yellow",
    "red",
    "green",
    "purple",
    "orange"
];
ss.initialize(
    // on connect
    function (id) {
        userInfo.set(id, {
            "id": id,
            "username": null,
            "room": null,
            "color": null,
            "ball": {
                "top": null,
                "left": null,
                "size": null,
                "score": null
            }
        });
        ss.broadcast("client connected: " + id);
        console.log(id + " connected!");
    },
    // on disconnect
    function (id) {
        let info = userInfo.get(id);
        console.log("client disconnected: "+ info.username + " " + id);
        ss.broadcast({
            "action": "playerDisconnectShowChat",
            "data": info.username
        });
        userInfo.delete(id);
    },
    // on message
    function (id, data) {
        let info = userInfo.get(id);
        switch(data.action){
            case "setusername":
                info.username = data.data;
                info.room = data.room;
                ss.broadcast({
                    "action": "playerJoinShowChat",
                    "data": info.username
                });
                ss.broadcast({
                    "action": "sendUpdatePlayers",
                    "data": sendUpdatePlayers()
                });
                ss.broadcast("["+ info.username + " joined the game]");
            break;
            case "chat":
                var chatColor = "black";
                if(info.color != null){
                    var chatColor = info.color;
                }
                ss.broadcast({
                    "action": "updateChat",
                    "username": info.username,
                    "color": chatColor,
                    "data": data.data
                });
            break;
            case "spawnParticles":
                spawnParticle();
            break;
            case "clearParticles":
                clearParticles();
            break;
            case "enterGame":
                info.ball.top = Math.floor(Math.random() * 875);
                info.ball.left = Math.floor(Math.random() * 1590);
                info.ball.size = 15;
                info.ball.score = 0;
                const color = Math.floor(Math.random() * colors.length);
                info.color = colors[color];
                ss.broadcast({
                    "action": "enterGame",
                    "id": id,
                    "username": info.username,
                    "data": {
                        "top": info.ball.top,
                        "left": info.ball.left,
                        "size": info.ball.size,
                        "points": info.ball.score,
                        "color": info.color
                    }
                });
            break;
            case "move":
                switch(data.data){
                    case "up":
                        if(info.ball.top >= 0){
                            info.ball.top --;
                        }
                    break;
                    case "down":
                        if(info.ball.top + info.ball.size <= 882){
                            info.ball.top ++;
                        }
                    break;
                    case "left":
                        if(info.ball.left >= 0){
                            info.ball.left --;
                        }
                    break;
                    case "right":
                        if(info.ball.left + info.ball.size <= 1597){
                            info.ball.left ++;
                        }
                    break;
                }
                ss.broadcast({
                    "action": "move",
                    "id": id,
                    "data": {
                        "top": info.ball.top,
                        "left": info.ball.left,
                        "size": info.ball.size,
                        "score": info.ball.score
                    }
                });
            break;
            case "eatenParticle":
                info.ball.size ++;
                info.ball.score ++;
                ss.broadcast({
                    "action": "updateChat",
                    "username": info.username,
                    "color": info.color,
                    "data": "grew"
                })
                userInfo.forEach(function(client){
                    ss.broadcast({
                        "action": "updateSize",
                        "id": client.id,
                        "data": client.ball
                    });
                    ss.broadcast({
                        "action": "removeParticle",
                        "data": {
                            "top": data.data.top,
                            "left": data.data.left
                        }
                    })
                });
            break;
        }
    }
);
function sendUpdatePlayers() {
    ss.broadcast({
        "action": "updatePlayers",
        "data": getPlayers()
    });
}
function getPlayers() {
    let result = [];
    userInfo.forEach((value, key) => {
        result.push(value);
    });
    return result;
}
function spawnParticle(){
        var u = Math.floor(Math.random() * 40);
        for(var i = u; i > 0; i --){
            var randomTop = Math.floor(Math.random() * 875);
            var randomLeft = Math.floor(Math.random() * 1590);
            const color = Math.floor(Math.random() * colors.length);
            ss.broadcast({
                "action": "spawnParticle",
                "data": {
                    "top": randomTop,
                    "left": randomLeft,
                    "color": colors[color]
                }
            });
    }
}
function clearParticle(){
    ss.broadcast({
        "action": "clearParticle"
    });
}
function clearParticles(){
    ss.broadcast({
        "action": "clearParticles"
    });
}
setInterval(function() {
    spawnParticle();
}, 1500);
setInterval(function() {
    var u = Math.floor(Math.random() * 30);
    for(var i = u; i > 0; i --){
        clearParticle();
    }
}, 3000);