import Board from "../game/Board.js";
import TimeCounter from "./TimeCounter.js";
import ScoreBoard from "./ScoreBoard.js";

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

        this.timeCounter = null;

        this.scoreBoard = null;

        this.time = 0.05;
        this.timeCount = 0;

        APP.addChild(this);
    }

    Load() {
        // Init board
        this.board = new Board();
        this.addChild(this.board);
        this.board.load();
        for(let i = 0; i < 3; i++) {
            this.board.spawn();
        }
        this.board.x = 0;
        this.board.y = (GameConfig.height - GameConfig.width) / 2;

        // Init background
        this.bg = new PIXI.Sprite(this.texture_Bg);
        this.addChildAt(this.bg, 0);
        this.bg.width = GameConfig.width;
        this.bg.height = GameConfig.height;
        this.bg.x = GameConfig.width / 2;
        this.bg.y = GameConfig.height / 2;
        this.bg.anchor.set(0.5);

        // Init retry button
        this.retry_Button = new PIXI.Sprite(this.texture_RetryButton);
        this.addChild(this.retry_Button);
        this.retry_Button.width = this.retry_Button.height = GameConfig.width / 6;
        this.retry_Button.x = this.retry_Button.width;
        this.retry_Button.y = GameConfig.height - this.retry_Button.height;
        this.retry_Button.anchor.set(0.5);
        this.retry_Button.buttonMode = true;
        this.retry_Button.interactive = true;
        this.retry_Button.on('mousedown', this.onRetryClick);

        // Init back button
        this.back_Button = new PIXI.Sprite(this.texture_BackButton);
        this.addChild(this.back_Button);
        this.back_Button.width = this.back_Button.height = GameConfig.width / 6;
        this.back_Button.x = GameConfig.width - this.back_Button.width;
        this.back_Button.y = GameConfig.height - this.back_Button.height;
        this.back_Button.anchor.set(0.5);
        this.back_Button.buttonMode = true;
        this.back_Button.interactive = true;
        this.back_Button.on('mousedown', this.onBackClick);

        // Init time counter
        this.timeCounter = new TimeCounter();
        this.addChild(this.timeCounter);
        this.timeCounter.slider.setSize(GameConfig.width * 0.9, GameConfig.height * 0.01);
        this.timeCounter.x = GameConfig.width / 2;
        this.timeCounter.y = this.board.y + GameConfig.width * 1.05;

        // Init score board
        this.scoreBoard = new ScoreBoard();
        this.addChild(this.scoreBoard);
        this.scoreBoard.x = GameConfig.width / 2;
        this.scoreBoard.y = this.board.y  - this.scoreBoard.scoreText.style.fontSize - GameConfig.width * 0.05;

        this.x = (APP.renderer.width - GameConfig.width) / 2;
    }

    Update(deltaTime) {
        this.timeCounter.Update(deltaTime);
        // this.timeCount += deltaTime;
        // if (this.timeCount >= this.time) {
        //     this.board.spawn();
        //     this.timeCount = 0;
        // }
    }

    resetTimer() {
        this.timeCounter.resetTime();
    }

    stopTimer() {
        this.timeCounter.stop();
    }

    resumeTimer() {
        this.timeCounter.resume();
    }

    startTimer() {
        this.timeCounter.start();
    }

    spawnBall() {
        for(let i = 0; i < 2; i++) {
            this.board.spawn();
        }
    }

    addScore(score) {
        this.scoreBoard.addScore(score);
    }

    Unload() {
        this.removeChildren();
    }

    gameOver() {
        const GS_GameOver = require('../game/GS_GameOver');
        StateManager.SwitchState(GS_GameOver);
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