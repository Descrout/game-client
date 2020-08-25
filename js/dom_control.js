class DomControl{
    constructor(){
    }

    init(){
        this.login = document.getElementById("login");
        this.lobby = document.getElementById("lobby");
        this.players = document.getElementById("playersTable");
        this.chatBox = document.getElementById("chatBox");

        $('#chatInputBox').keypress(function(event) {
            if (event.keyCode == 13 || event.which == 13) {
                let msg = $(this).val();
                if(msg != ""){
                    socket.send(SendHeader.CHAT, {name: "", message:msg});
                    $(this).val("");
                }
            }
        });
    }

    pushMessage(msg){
        this.chatBox.innerHTML += `<i>${msg.name}</i>`;
        this.chatBox.innerText += ` : ${msg.message}\n`;
        this.chatBox.scrollTop = chatBox.scrollHeight;
    }

    intoLobby(){
        this.login.style.display = "none";
        this.lobby.style.display = "inline";
    }

    updatePlayers(players){
        $(this.players).find('tbody').empty();
        players.reverse().forEach((player)=>{
            $(this.players).find('tbody').append(`<tr><td>${player.id}</td>
            <td>${player.name}</td></tr>`);
        });
    }

    updateRooms(rooms){

    }
}