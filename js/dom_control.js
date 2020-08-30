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
        this.game = document.getElementById("game");
        this.players = document.getElementById("playersTable");
        this.chatBox = document.getElementById("chatBox");
        this.myName = document.getElementById("myName");


        $('#chatInputBox').keypress((event) =>{
            if (event.keyCode == 13 || event.which == 13) {
                let msg = $('#chatInputBox').val();
                if(msg != ""){
                    if(msg.length < 103)
                        socket.send(SendHeader.LOBBY_CHAT, {name: "", message:msg});
                    else this.pushMessage({name:"Error", message:"Your message was too long."})
                    $('#chatInputBox').val("");
                }
            }
        });

        $('#disconnectButton').click(()=>{
            socket.close();
        });

    }

    pushMessage(msg){
        this.chatBox.innerHTML += `<b>${msg.name}</b> : ${msg.message.replace("<","&lt;")} <br>`;
        this.chatBox.scrollTop = chatBox.scrollHeight;
    }

    intoGame() {
        this.hideLoading();
        this.lobby.style.display = "none";
        this.game.style.display = "inline";
        this.game.appendChild(game.app.view);
        game.setup();
    }

    intoLobby(){
        this.state = DomState.LOBBY;
        this.login.style.display = "none";
        this.game.style.display = "none";
        this.lobby.style.display = "inline";

        this.hideLoading();

        if(!this.roomTable)
        this.roomTable = $('#roomTable').DataTable({
            "oLanguage": {
              "sEmptyTable": "There is noone playing :(",
              "sZeroRecords": "There is no room :(",
              "sInfo":"Showing _TOTAL_ rooms(_START_ to _END_)",
              "sInfoEmpty": "No rooms to show",
              "sSearch": "Search Room:",
              "sLengthMenu": "Show _MENU_ rooms"
            },
            scrollY: 290
          });

        $('.dataTables_length').addClass('bs-select');

        $('#roomTable tbody').on('click', 'tr',  function() {
            var data = domControl.roomTable.row(this).data();
            if(!data) return;
            const id = data[0];
            if(data[2]=="YES"){
                $('#roomIdHidden').val(id);
                $('#roomPassModal').modal();
            }else{
                domControl.showLoading();
                socket.send(SendHeader.JOIN_ROOM, {id: id});
            }
        } );
    }

    updateRooms(rooms){
        this.roomTable.clear();
        
        for(const room of rooms){
            let room_password = (room.password) ? "YES" : "NO";
            this.roomTable.row.add([room.id,room.name,room_password,room.players+"/6"]);   
        }
        
        this.roomTable.draw();
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

    showLoading(){
        $('#loadMe').modal({
            backdrop: "static",
            keyboard: false,
            show: true //Display loader!
        });
    }

    hideLoading(){
        setTimeout(()=>{
            $('#loadMe').modal("hide");
        }, 500);
    }

    createRoom(){
        this.showLoading();
        let room_to_create = $('#roomname2').val();
        let pass = $('#roompass2').val();
        if(room_to_create.length < 4) return;
        $('#newRoomModal').modal("hide");
        socket.send(SendHeader.CREATE_ROOM, {name: room_to_create, password: pass});
        $('#roomname2').val("");
        $('#roompass2').val("");
    }

    showError(err) {
        this.hideLoading();
        $('#errorModalLabel').text(err.title);
        $('#errorMsg').text(err.message);
        $('#errorModal').modal();
    }

    tryPassword(){
        let pass = $("#roompassJoin").val();
        if(pass == "") return;
        let id = $('#roomIdHidden').val();
        $("#roompassJoin").val("");
        $('#roomPassModal').modal("hide");

        this.showLoading();

        socket.send(SendHeader.JOIN_ROOM, {id:id, password: pass});
    }

}