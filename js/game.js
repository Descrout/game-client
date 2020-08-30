class Game{
    constructor(){
        this.app = new PIXI.Application({
            width: 800, height: 600, 
            backgroundColor: 0x1099bb, 
            resolution: window.devicePixelRatio || 1});
        this.app.stop();
        this.textures = {};
        this.keys = {};
        this.players = new Map();
        this.loaded = false;
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
        this.app.ticker.add(this.update);
    }

    getOrAddEntity(id){
        let entity = game.players.get(id);
        if(entity) return entity;
        entity = game.players.set(id, new PIXI.Sprite(game.textures.hitman)).get(id);
        game.app.stage.addChild(entity);
        return entity;
    }

    updateState(state){
        for(const pos of state.entities) {
            const entity = game.getOrAddEntity(pos.id);
            entity.shouldRemove = false;
            entity.x = pos.x;
            entity.y = pos.y;
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

    update(delta) {
        socket.send(SendHeader.GAME_INPUT, {up: game.keys[38], down: game.keys[40], left: game.keys[37], right: game.keys[39]});
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
        socket.send(SendHeader.QUIT_TO_LOBBY, {});
        domControl.showLoading();
    }
}