import Board from "./Board";

class Ball extends PIXI.Sprite {
    constructor() {
		super();
		this.texture = PIXI.Texture.from('data/image/ball.png');

		this.scaleWhenChosen = 1.2;
		this.color;
    }

    enableEvent(event, callback) {
        this.on(event, callback);
    }

    enableButton(isEnable) {
		if(isEnable) {
			this.on('pointerdown', this.onCLick);
		}
		else {
			this.off('pointerdown', this.onCLick);
		}
        this.buttonMode = isEnable;
        this.interactive = isEnable;
    }

    onCLick() {
		var board = this.parent.parent;
		for (var row = 0; row < board.rowNum; row++) {
			for (var column = 0; column < board.columnNum; column++) {
				board.arrBlocks[row][column].tint = 0xffffff;
			}
		}

		if (board.choosenBlock != null) {
			if (board.choosenBlock != this) {
				board.choosenBlock.scale.x = board.choosenBlock.scale.x / this.scaleWhenChosen;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y / this.scaleWhenChosen;

				board.choosenBlock = this;
				board.choosenBlock.scale.x = board.choosenBlock.scale.x * this.scaleWhenChosen;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y * this.scaleWhenChosen;
			}
		}
		else {
			board.choosenBlock = this;
			board.choosenBlock.scale.x = board.choosenBlock.scale.x * this.scaleWhenChosen;
			board.choosenBlock.scale.y = board.choosenBlock.scale.y * this.scaleWhenChosen;
		}
	}

}

export default Ball;