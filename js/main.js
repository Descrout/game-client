let socket = new Network("6444");


function initAll(name){
    socket.connect().then(()=>{
        socket.send(SendHeader.SETNAME, {name: name});
    }).catch((err)=>{
        console.error(err);
    });
}