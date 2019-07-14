import Board from "../game/Board.js";

class GS_Ingame extends PIXI.Container {
	constructor() {
        super();
        
        let board = null; 
        
        this.texture_Bg = PIXI.Texture.from('data/image/background.png');
        this.bg = null;

        this.texture_RetryButton = PIXI.Texture.from('data/image/ui/retryButton.png');
        this.retry_Button = null;

        this.texture_BackButton = PIXI.Texture.from('data/image/ui/backButton.png');
        this.back_Button = null;

        APP.addChild(this);
    }
    
    Load() {
        this.board = new Board();
        this.addChild(this.board); 
        this.board.load();
        this.board.spawn();
        this.board.x = 0;
        this.board.y = (GameConfig.height - GameConfig.width) / 2;

        this.bg = new PIXI.Sprite(this.texture_Bg);  
        this.addChildAt(this.bg, 0);
        this.bg.width = GameConfig.width;
        this.bg.height = GameConfig.height;
        this.bg.x = GameConfig.width / 2;
        this.bg.y = GameConfig.height/ 2;
        this.bg.anchor.set(0.5);

        // Init retry button
        this.retry_Button = new PIXI.Sprite(this.texture_RetryButton);  
        this.addChild(this.retry_Button);
        this.retry_Button.width = this.retry_Button.height = GameConfig.width / 6;
        this.retry_Button.x = GameConfig.width * 0.25;
        this.retry_Button.y = GameConfig.height * 0.9;
        this.retry_Button.anchor.set(0.5);
        this.retry_Button.buttonMode = true;
        this.retry_Button.interactive = true;
        this.retry_Button.on('mousedown', this.onRetryClick);

        this.back_Button = new PIXI.Sprite(this.texture_BackButton);  
        this.addChild(this.back_Button);
        this.back_Button.width = this.back_Button.height = GameConfig.width / 6;
        this.back_Button.x = GameConfig.width * 0.75;
        this.back_Button.y = GameConfig.height * 0.9;
        this.back_Button.anchor.set(0.5);
        this.back_Button.buttonMode = true;
        this.back_Button.interactive = true;
        this.back_Button.on('mousedown', this.onBackClick);
    }

    Update(deltaTime) {
        this.board.Update();
    }

    Unload() {
        this.removeChildren();
    }

    onRetryClick() {
        const GS_Ingame = require('../game/GS_Ingame');
        StateManager.SwitchState(GS_Ingame);
    }
    
    onBackClick() {
        const GS_MainMenu = require('../game/GS_MainMenu');
        StateManager.SwitchState(GS_MainMenu);
    }
}
module.exports = new GS_Ingame();