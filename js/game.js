function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Game {
    constructor() {
        this.app = new PIXI.Application({
            width: 800, height: 600,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1
        });
        this.app.stop();
        this.textures = {};
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.players = new Map();
        this.loaded = false;
        this.myEntity = { x: 0, y: 0 };
        this.pending_inputs = [];
        this.sequence = 0;
        this.updateTimer  = 0;
        this.tickRate = 60;
        this.lastUpdateTs = -1;
        this.server_tick = 45;

        this.receiveTime = 0;
        this.delta = 0;
        this.accumulator = 0;
        this.lagPackets = new Array();
    }


    init(state) {
        domControl.state = DomState.GAME;
        if (!game.loaded) {
            PIXI.Loader.shared
                .add("hitman", "../assets/hitman1_gun.png")
                .load((loader, resources) => {
                    game.textures.hitman = resources.hitman.texture;
                    game.receive(state);
                    domControl.intoGame();
                    game.loaded = true;
                });
        } else {
            this.receive(state);
            domControl.intoGame();
        }
    }


    setup() {
        this.app.start();
        window.addEventListener("keydown", this.keysDown);
        window.addEventListener("keyup", this.keysUp);
        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", this.mouseMove);
        setInterval(() => {
            game.waitRecv();
            game.interpolateEntities();
            game.send();
        }, 1000 / game.tickRate);
    }

    getOrAddEntity(pos) {
        let entity = game.players.get(pos.id);
        if (entity) return entity;
        entity = game.players.set(pos.id, new PIXI.Sprite(game.textures.hitman)).get(pos.id);
        entity.anchor.set(0.3, 0.5);
        if (pos.id == domControl.me) game.myEntity = entity;
        else entity.pos_buffer = [];

        entity.x = pos.x;
        entity.y = pos.y;
        entity.rotation = pos.angle;
        game.app.stage.addChild(entity);
        return entity;
    }

    waitRecv(){
        const nowTs = Date.now();
        const lastUpdateTs = this.lastUpdateTs >= 0 ? this.lastUpdateTs : nowTs;
        this.delta = (nowTs - lastUpdateTs) / 1000;
        this.lastUpdateTs = nowTs;

        this.accumulator += this.delta;
        while(this.accumulator >= 0.045){
            this.accumulator -= 0.045;
            if(this.lagPackets.length > 0)
                this.receive(this.lagPackets.shift());
            
        }
    }

    receive(state) {
        for (const pos of state.entities) {
            const entity = game.getOrAddEntity(pos);
            entity.shouldRemove = false;
            if (pos.id == domControl.me) {
                entity.x = pos.x;
                entity.y = pos.y;
                entity.rotation = pos.angle;

                game.pending_inputs = game.pending_inputs.filter(input => {
                    return input.sequence > state.last_seq;
                });

                game.pending_inputs.forEach(input => {
                    game.applyInput(input);
                });
            }else {
                entity.pos_buffer.push([Date.now(), pos]);
            }
        }
        this.server_tick = Date.now() - this.receiveTime;
        this.receiveTime = Date.now();
        console.log(this.server_tick);
        //if(this.server_tick < 45) this.server_tick = 45;
        for (const [key, value] of game.players.entries()) {
            if (value.shouldRemove) {
                game.app.stage.removeChild(value);
                game.players.delete(key);
            } else {
                value.shouldRemove = true;
            }
        }
    }

    applyInput(input) {
        game.myEntity.y += 300 * input.verticalPress;
        game.myEntity.x += 300 * input.horizontalPress;
        game.myEntity.rotation = input.angle;
    }

    interpolateEntities() {
        let now = Date.now();
        let render_timestamp = now - 45;
        
        for (const [key, player] of game.players.entries()) {
            if (key == domControl.me) continue;
            
            let buffer = player.pos_buffer;
       
            while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
                buffer.shift();
            }

            if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
                var pos0 = buffer[0][1];
                var pos1 = buffer[1][1];
                var t0 = buffer[0][0];
                var t1 = buffer[1][0];

                let alpha = (render_timestamp - t0) / (t1 - t0);

                player.x = pos0.x + (pos1.x - pos0.x) * alpha;
                player.y = pos0.y + (pos1.y - pos0.y) * alpha;

                let max = Math.PI * 2;
                let da = (pos1.angle - pos0.angle) % max;
                let short = 2 * da % max - da;
                player.rotation = pos0.angle + short * alpha;
                player.alpha = 0.5;
            }
        }
    }

    send() {
        let dx = game.mouse.x - game.myEntity.x;
        let dy = game.mouse.y - game.myEntity.y;
        let angle = Math.atan2(dy, dx);

        let horiTime = 0;
        let verTime = 0;

        if(game.keys[87]){
            verTime = -this.delta;
        }else if(game.keys[83]){
            verTime = this.delta;
        }

        if(game.keys[65]){
            horiTime = -this.delta;
        }else if(game.keys[68]){
            horiTime = this.delta;
        }

        if (horiTime == 0 && verTime == 0 && angle == this.myEntity.rotation) return;

        let input = {
            horizontalPress: horiTime, verticalPress: verTime,
            angle: angle, sequence: game.sequence++,
        };

        socket.send(SendHeader.GAME_INPUT, input);
        this.applyInput(input);
        this.pending_inputs.push(input);
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

    chat(str){
        socket.msg_lag = Date.now();
        socket.send(SendHeader.GAME_CHAT, {name: "", message:str});
    }

    quit() {
        window.removeEventListener("keydown", this.keysDown);
        window.removeEventListener("keyup", this.keysUp);
        this.keys = {};
        this.app.stop();
        this.app.stage.removeChildren();
        this.players.clear();
        this.pending_inputs = [];
        this.sequence = 0;
        this.accumulator = 0.0;
        socket.send(SendHeader.QUIT_TO_LOBBY, {});
        domControl.showLoading();
    }
}