const Application = require('../core/Application');

class GS_MainMenu extends PIXI.Container {
	constructor() {
        super();
        
        this.texture_PlayButton = PIXI.Texture.from('data/image/ui/playButton.png');
        this.play_Button = null;

        this.texture_Bg = PIXI.Texture.from('data/image/background.png');
        this.bg = null;

        APP.addChild(this);
    }
    
    Load() {
        this.play_Button = new PIXI.Sprite(this.texture_PlayButton);  
        this.addChild(this.play_Button);
        this.play_Button.x = GameConfig.width / 2;
        this.play_Button.y = GameConfig.height/ 2;
        this.play_Button.anchor.set(0.5);

        this.bg = new PIXI.Sprite(this.texture_Bg);  
        this.addChildAt(this.bg, 0);
        this.play_Button.buttonMode = true;
        this.play_Button.interactive = true;
        this.play_Button.on('mousedown', this.onPlayClick);

        this.bg.width = GameConfig.width;
        this.bg.height = GameConfig.height;
        this.bg.x = GameConfig.width / 2;
        this.bg.y = GameConfig.height/ 2;
        this.bg.anchor.set(0.5);
    }

    onPlayClick() {
        const GS_Ingame = require('../game/GS_Ingame');
        StateManager.SwitchState(GS_Ingame);
    }

    Update(deltaTime){
    }

    Unload() {
        this.removeChildren();
    }
}
module.exports = new GS_MainMenu();