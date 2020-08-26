const DomState = {
    LOGIN : 0,
    LOBBY : 1,
    GAME  : 2,
};

class DomControl{
    constructor(){
        this.state = DomState.LOGIN;
    }

    init(){
        this.login = document.getElementById("login");
        this.lobby = document.getElementById("lobby");
        this.players = document.getElementById("playersTable");
        this.chatBox = document.getElementById("chatBox");
        this.myName = document.getElementById("myName");

        $('#chatInputBox').keypress((event) =>{
            if (event.keyCode == 13 || event.which == 13) {
                let msg = $('#chatInputBox').val();
                if(msg != ""){
                    if(msg.length < 103)
                        socket.send(SendHeader.CHAT, {name: "", message:msg});
                    else this.pushMessage({name:"Error", message:"Your message was too long."})
                    $('#chatInputBox').val("");
                }
            }
        });

        $('#newGameButton').click(()=>{

        });

        $('#disconnectButton').click(()=>{
            socket.close();
        });

    }

    pushMessage(msg){
        this.chatBox.innerHTML += `<b>${msg.name}</b> : ${msg.message.replace("<","&lt;")} <br>`;
        this.chatBox.scrollTop = chatBox.scrollHeight;
    }

    intoLobby(){
        this.state = DomState.LOBBY;
        this.login.style.display = "none";
        this.lobby.style.display = "inline";
        $('#name').val("");
    }

    updatePlayers(id, players){
        $(this.players).find('tbody').empty();
        players.reverse().forEach((player)=>{
            let name = "";
            if(id == player.id){
                name = `<b>${player.name}</b>`;
                this.myName.innerHTML = name;
            }else{
                name = player.name;
            }
            $(this.players).find('tbody').append(`<tr><td>${player.id}</td>
            <td>${name}</td></tr>`);
        });
    }

    updateRooms(rooms){

    }

    showError(err) {
        $('#errorModalLabel').text(err.title);
        $('#errorMsg').text(err.message);
        $('#errorModal').modal();
        $('#errorModal').on('hidden.bs.modal', function (e) {
            $('#name').trigger('focus');
        });
    }
}