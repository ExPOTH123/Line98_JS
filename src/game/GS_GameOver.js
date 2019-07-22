const Application = require('../core/Application');

class GS_GameOver extends PIXI.Container {
    constructor() {
        super();

        this.texture_RetryButton = PIXI.Texture.from('data/image/ui/retryButton.png');
        this.retry_Button = null;

        this.texture_BackButton = PIXI.Texture.from('data/image/ui/backButton.png');
        this.back_Button = null;

        this.texture_Bg = PIXI.Texture.from('data/image/background.png');
        this.bg = null;

        this.texture_Title = PIXI.Texture.from('data/image/gameover.png');
        this.title = null;
        this.hueCounter;

        APP.addChild(this);
    }

    Load() {
        // Init background
        this.bg = new PIXI.Sprite(this.texture_Bg);
        this.bg.width = GameConfig.width;
        this.bg.height = GameConfig.height;
        this.bg.x = GameConfig.width / 2;
        this.bg.y = GameConfig.height / 2;
        this.bg.anchor.set(0.5);
        this.bg.tint = 0x555555;
        this.addChildAt(this.bg, 0);

        this.title = new PIXI.Sprite(this.texture_Title);
        const scale = GameConfig.width * 0.8 / this.bg.width;
        this.title.scale.x = scale;
        this.title.scale.y = scale;
        this.title.anchor.set(0.5);
        this.title.x = GameConfig.width / 2;
        this.title.y = GameConfig.height / 2;
        this.addChild(this.title);

        // Init retry button
        this.retry_Button = new PIXI.Sprite(this.texture_RetryButton);
        this.addChild(this.retry_Button);
        this.retry_Button.width = this.retry_Button.height = GameConfig.width / 6;
        this.retry_Button.x = GameConfig.width / 2 - this.retry_Button.width;
        this.retry_Button.y = this.title.y + this.title.height / 2 + this.retry_Button.height;
        this.retry_Button.anchor.set(0.5);
        this.retry_Button.buttonMode = true;
        this.retry_Button.interactive = true;
        this.retry_Button.on('mousedown', this.onRetryClick);

        // Init back button
        this.back_Button = new PIXI.Sprite(this.texture_BackButton);
        this.addChild(this.back_Button);
        this.back_Button.width = this.back_Button.height = GameConfig.width / 6;
        this.back_Button.x =  GameConfig.width / 2 + this.retry_Button.width;
        this.back_Button.y = this.title.y + this.title.height / 2 + this.retry_Button.height;
        this.back_Button.anchor.set(0.5);
        this.back_Button.buttonMode = true;
        this.back_Button.interactive = true;
        this.back_Button.on('mousedown', this.onBackClick);

        let colorMatrix = new PIXI.filters.ColorMatrixFilter();
        this.title.filters = [colorMatrix];

        this.x = (APP.renderer.width - GameConfig.width) / 2;
    }

    Update(deltaTime) {
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
module.exports = new GS_GameOver();