class ScoreBoard extends PIXI.Container {
    constructor() {
        super();

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: GameConfig.height * 0.1,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#009988'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
        });
        
        this.score = 0
        this.scoreText = new PIXI.Text(this.score, style);
        this.scoreText.anchor.set(0.5);

        this.addChild(this.scoreText);
    }

    addScore(score) {
        this.score += score;
        this.scoreText.text = this.score;
    }

    setScore(score) {
        this.score = score;
        this.scoreText.text = score;
    }
}

export default ScoreBoard;