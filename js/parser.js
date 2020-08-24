const SendHeader = {
    SETNAME: 0,
};

const ReceiveHeader = {
    LOBBY: 0,
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
        pbf.writeBytes(header);
        switch(header){
            case SendHeader.SETNAME:
                SetName.write(obj, pbf);
                break;
            default:
                console.error("Send header doesn't match !");
                return;
        }

        return pbf.finish();
    }

    static deSerialize(data){
        let pbf = new Pbf(data.slice(1));
        switch(data[0]){
            case ReceiveHeader.LOBBY: return Lobby.read(pbf);
            default:
                console.error("Receive header doesn't match");
                return;
        }
    }
}