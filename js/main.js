let socket = new Network(`ws://127.0.0.1:6444`);
let domControl = new DomControl();
let game = new Game();

function initAll(name) {
    $('#name').val("");
    domControl.showLoading();
    let promise = socket.connect(received);
    if (promise) {
        promise.then(() => {
            domControl.init();
            socket.send(SendHeader.HANDSHAKE, { name: name });
        }).catch((err) => {
            domControl.showError({ title: err, message: "Server is offline." })
        });
    }
}

function received(header, obj) {
    switch (header) {
        case ReceiveHeader.USERS:
            if (domControl.state != DomState.LOBBY) domControl.intoLobby();
            domControl.updatePlayers(obj.me, obj.users);
            break;
        case ReceiveHeader.ROOMS:
            domControl.updateRooms(obj.rooms);
            break;
        case ReceiveHeader.LOBBY_CHAT:
            domControl.pushMessage(obj);
            break;
        case ReceiveHeader.ERROR:
            domControl.showError(obj);
            break;
        case ReceiveHeader.GAME_CHAT:
            //domControl.showGameChat(obj); // you can implement gamechat here  
            break;
        case ReceiveHeader.STATE:
            if (domControl.state != DomState.GAME) game.init(obj);
            else if (game.loaded) game.incomingPackets.push(obj);
            break;
    }
}