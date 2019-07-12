import Board from "./Board";

class Ball {
    constructor(spriteFrame) {
		this.sprite = new PIXI.Sprite(spriteFrame);
    }

    enableEvent(event, callback) {
        this.sprite.on(event, callback);
    }

    enableButton(isEnable) {
		if(isEnable) {
			this.sprite.on('pointerdown', this.onCLick);
		}
		else {
			this.sprite.off('pointerdown', this.onCLick);
		}
        this.sprite.buttonMode = isEnable;
        this.sprite.interactive = isEnable;
    }

    onCLick() {
		var board = this.parent.parent;
		console.log(board);
		for (var row = 0; row < board.rowNum; row++) {
			for (var column = 0; column < board.columnNum; column++) {
				board.arrBlocks[row][column].tint = 0xffffff;
			}
		}

		if (board.choosenBlock != null) {
			if (board.choosenBlock != this) {
				board.choosenBlock.scale.x = board.choosenBlock.scale.x / 1.1;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y / 1.1;

				board.choosenBlock = this;
				board.choosenBlock.scale.x = board.choosenBlock.scale.x * 1.1;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y * 1.1;
			}
		}
		else {
			board.choosenBlock = this;
			board.choosenBlock.scale.x = board.choosenBlock.scale.x * 1.1;
			board.choosenBlock.scale.y = board.choosenBlock.scale.y * 1.1;
		}
	}

}

export default Ball;