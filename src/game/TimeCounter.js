import Slider from "./Slider";

class TimeCounter extends PIXI.Container{
    constructor() {
        super();

        this.timeCount = GameDefine.TIME_PER_TURN;
        this.slider = new Slider();

        this.addChild(this.slider);
    }

    Update(deltaTime) {
        this.timeCount -= deltaTime;
        this.slider.setPercent(this.timeCount / GameDefine.TIME_PER_TURN);

        if(this.timeCount <= 0) {
            this.timeCount = GameDefine.TIME_PER_TURN;
            this.spawnBall();
        }
    }

    resetTime() {
        this.timeCount = GameDefine.TIME_PER_TURN;
    }

    spawnBall() {
        let gamestate = require('./GS_Ingame');
        gamestate.spawnBall();
    }
}
export default TimeCounter