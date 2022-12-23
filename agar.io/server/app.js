let SocketServerClass = require("./SocketServer");

let ss = new SocketServerClass();

let userInfo = new Map();

ss.initialize(
    // on connect
    function (id) {
        userInfo.set(id, {
            "id": id,
            "username": null,
            "room": null
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
                console.log(data.data);
                ss.broadcast({
                    "action": "updateChat",
                    "username": info.username,
                    "data": data.data
                });
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
function getPlayersOnId(id) {
    let result = [];
    userInfo.forEach((value, key) => {
        if(value == id){
            return value;
        }
    });
}
