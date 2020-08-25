let socket = new Network("6444");
let domControl = new DomControl();


function initAll(name){
    let promise = socket.connect(received);
    if (promise){
        promise.then(()=>{
            domControl.init();
            socket.send(SendHeader.HANDSHAKE, {name: name});
        }).catch((err)=>{
            console.error(err);
        });
    }
}

function received(header, obj){
    console.log(`Message Received : ${obj}`);
    switch(header){
        case ReceiveHeader.LOBBY:
            domControl.intoLobby();
            domControl.updatePlayers(obj.users);
            domControl.updateRooms(obj.rooms);  
        break;
        case ReceiveHeader.CHAT:
            domControl.pushMessage(obj);
        break;
    }
}