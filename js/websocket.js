class Network{
    constructor(port){
        if (!("WebSocket" in window)){
            alert("WebSocket NOT supported by your Browser!");
            return;
        }
        this.port = port;
    }

    connect(){
        if(this.ws) return;

        this.ws = new WebSocket(`ws://${window.location.hostname}:${this.port}`);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onmessage = this.messageReceived;

        let promise = new Promise((resolve, reject) => {
            this.ws.onopen = () => {
                this.connected();
                resolve("Connected!");
            };
            
            this.ws.onclose = () => {
                this.disconnected();
                this.ws = null;
                reject("Offline!");
            };
        });
        
        return promise;
    }

    send(out, obj) {
        this.ws.send(Parser.serialize(out, obj));
    }

    connected(){
        console.log("Connection successful :)");
    }

    messageReceived(e){
        let data = new Uint8Array(e.data);
        let obj = Parser.deSerialize(data);
        if(!obj) return;

        console.log(`Message Received : ${obj}`);
    }

    disconnected(){
        console.log("Connection closed :(");
    }
}