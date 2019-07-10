import Board from "../game/Board.js";

class GS_Ingame extends PIXI.Container {
	constructor() {
        super();
        
        let board = null;        
        APP.addChild(this);
    }
    
    Load() {
        this.board = new Board();
        this.addChild(this.board);

        this.board.Load();
        this.board.Spawn();
    }

    Update(deltaTime) {
    }
}
module.exports = new GS_Ingame();