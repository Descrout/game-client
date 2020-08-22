class Network{
    constructor(port){
        if (!("WebSocket" in window)){
            alert("WebSocket NOT supported by your Browser!");
            return;
        }

        this.ws = new WebSocket(`ws://${window.location.hostname}:${port}`);

        this.ws.onopen = this.connected;
        this.ws.onmessage = this.messageReceived;
        this.ws.onclose = this.disconnected;
    }

    connected(){
        console.log("Connection successful :)");
    }

    messageReceived(e){
        console.log(`Message Received : ${e.data}`);
    }

    disconnected(){
        console.log("Connection closed :(");
    }
}