const SendHeader = {
    HANDSHAKE: 0,
    CREATE_ROOM: 1,
    JOIN_ROOM: 2,
    CHAT: 3,
};

const ReceiveHeader = {
    LOBBY: 0,
    CHAT: 1,
};

class Parser{
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
            case SendHeader.CHAT:
                Chat.write(obj, pbf);
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
            case ReceiveHeader.LOBBY: return Lobby.read(pbf);
            case ReceiveHeader.CHAT: return Chat.read(pbf);
            default:
                console.error("Receive header doesn't match");
                return;
        }
    }
}