class Game{
    constructor(){
        this.app = new PIXI.Application({
            width: 800, height: 600, 
            backgroundColor: 0x1099bb, 
            resolution: window.devicePixelRatio || 1});
        this.app.stop();
        this.textures = {};
        this.keys = {};
        this.mouse = {x: 0, y: 0};
        this.players = new Map();
        this.loaded = false;
        this.myEntity = {x: 0, y: 0};
        this.pending_inputs = new Array();
        this.sequence = 0;
        this.dt = 0.016;
        this.accumulator = 0.0;
    }

    init(state) {
        domControl.state = DomState.GAME;
        if(!game.loaded){
            PIXI.Loader.shared
            .add("hitman", "../assets/hitman1_gun.png")
            .load((loader, resources)=>{
                game.textures.hitman = resources.hitman.texture;
                game.updateState(state);
                domControl.intoGame();
                game.loaded = true;
            });
        }else {
            this.updateState(state);
            domControl.intoGame();
        }
    }

    setup() {
        this.app.start();
        window.addEventListener("keydown", this.keysDown);
        window.addEventListener("keyup", this.keysUp);
        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", this.mouseMove);
        this.app.ticker.add(()=>{
            this.dt = this.app.ticker.elapsedMS / 1000;
            this.update();
            this.send();
        });
    }

    getOrAddEntity(pos){
        let entity = game.players.get(pos.id);
        if(entity) return entity;
        entity = game.players.set(pos.id, new PIXI.Sprite(game.textures.hitman)).get(pos.id);
        entity.x = pos.x;
        entity.y = pos.y;
        entity.rotation = pos.angle;
        entity.anchor.set(0.3, 0.5);
        if(pos.id == domControl.me) game.myEntity = entity;
        game.app.stage.addChild(entity);
        return entity;
    }

    updateState(state){
        for(const pos of state.entities) {
            const entity = game.getOrAddEntity(pos);
            entity.shouldRemove = false;
            if(pos.id == domControl.me){
                entity.x = pos.x;
                entity.y = pos.y;
                entity.rotation = pos.angle;
                let i = 0;
                while (i < game.pending_inputs.length) {
                    let input = game.pending_inputs[i];
                    if(input.sequence <= state.last_seq) {
                        game.pending_inputs.splice(i, 1);
                    }else{
                        game.applyInput(input);
                        i++;
                    }
                }
            }else{
                entity.target_x = pos.x;
                entity.target_y = pos.y;
                entity.target_rotation = pos.angle;
            }
        }

        for (const [key, value] of game.players.entries()) {
            if(value.shouldRemove){
                game.app.stage.removeChild(value);
                game.players.delete(key);
            }else {
                value.shouldRemove = true;
            }
        }
  
    }

    applyInput(input) {
        if(input.up) game.myEntity.y -= 300 * game.dt;
        if(input.down) game.myEntity.y += 300 * game.dt;
        if(input.left) game.myEntity.x -= 300 * game.dt;
        if(input.right) game.myEntity.x += 300 * game.dt;
        game.myEntity.rotation = input.angle;
    }

    update() {
        for (const [key, player] of game.players.entries()) {
            if(key != domControl.me){
                player.x += (player.target_x - player.x) * 0.06;
                player.y += (player.target_y - player.y) * 0.06;
                //player.rotation += (player.target_rotation - player.rotation) * 0.05;
                player.rotation = player.target_rotation;
            }
        }
    }

    send() {
        let dx = game.mouse.x - game.myEntity.x;
        let dy = game.mouse.y - game.myEntity.y;
        let angle = Math.atan2(dy, dx);

        let up = game.keys[87];
        let down = game.keys[83];
        let left = game.keys[65];
        let right = game.keys[68];

        //if(up == down && left == right && angle == this.myEntity.rotation) return;
        
        let input = {
            up: up, down: down,
            left: left, right: right,
            angle: angle, sequence: game.sequence++,
        };
        this.applyInput(input);
        this.pending_inputs.push(input);
        socket.send(SendHeader.GAME_INPUT, input);
    }

    mouseMove(e) {
        game.mouse = e.data.global;
    }

    keysDown(e) {
        game.keys[e.keyCode] = true;
    }

    keysUp(e) {
        game.keys[e.keyCode] = false;
    }

    quit() {
        window.removeEventListener("keydown", this.keysDown);
        window.removeEventListener("keyup", this.keysUp);
        this.keys = {};
        this.app.stop();
        this.app.stage.removeChildren();
        this.players.clear();
        this.pending_inputs.clear();
        this.sequence = 0;
        this.accumulator = 0.0;
        socket.send(SendHeader.QUIT_TO_LOBBY, {});
        domControl.showLoading();
    }
}