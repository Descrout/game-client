const SendHeader = {
    HANDSHAKE: 0,
    CREATE_ROOM: 1,
    JOIN_ROOM: 2,
    LOBBY_CHAT: 3,
    QUIT_TO_LOBBY: 4,
    GAME_CHAT: 5,
    GAME_INPUT: 6,
};

const ReceiveHeader = {
    USERS: 0,
    ROOMS: 1,
    LOBBY_CHAT: 2,
    ERROR: 3,
    GAME_CHAT: 4,
    STATE: 5,
};


class Parser{
    //export headers to rust
    //so we can be on the same page
    static headersToRust(){
        let txt = "pub mod SendHeader {\n";
        for (const [name, val] of Object.entries(ReceiveHeader)) {
            txt += `    pub const ${name}: u8 = ${val};\n`;
        }
        txt += "}\n\npub mod ReceiveHeader {\n";
        for (const [name, val] of Object.entries(SendHeader)) {
            txt += `    pub const ${name}: u8 = ${val};\n`;
        }
        txt += "}";
        return txt;
    }

    static serialize(header, obj){
        let pbf = new Pbf();
        pbf.writeBytes([header]);
        switch(header){
            case SendHeader.HANDSHAKE:
                Handshake.write(obj, pbf);
                break;
            case SendHeader.LOBBY_CHAT:
                Chat.write(obj, pbf);
                break;
            case SendHeader.CREATE_ROOM:
                CreateRoom.write(obj, pbf);
                break;
            case SendHeader.JOIN_ROOM:
                JoinRoom.write(obj, pbf);
                break;
            case SendHeader.QUIT_TO_LOBBY:
                QuitLobby.write(obj, pbf);
                break;
            case SendHeader.GAME_CHAT:
                Chat.write(obj, pbf);
                break;
            case SendHeader.GAME_INPUT:
                GameInput.write(obj, pbf);
                break;
            default:
                console.error("Send header doesn't match !");
                return;
        }

        return pbf.finish().slice(1);
    }

    static deSerialize(data){
        let pbf = new Pbf(data.slice(1));
        switch(data[0]){
            case ReceiveHeader.USERS: return Users.read(pbf);
            case ReceiveHeader.ROOMS: return Rooms.read(pbf);
            case ReceiveHeader.LOBBY_CHAT: return Chat.read(pbf);
            case ReceiveHeader.ERROR: return Error.read(pbf);
            case ReceiveHeader.GAME_CHAT: return Chat.read(pbf);
            case ReceiveHeader.STATE: return State.read(pbf);
            default:
                console.error("Receive header doesn't match");
                return;
        }
    }
}