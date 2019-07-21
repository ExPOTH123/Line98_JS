import Board from "./Board";

class Block extends PIXI.Sprite {
	constructor() {
		super();
		this.texture = PIXI.Texture.from('data/image/block.png');

		this.index_X;
		this.index_Y;
	}

	enableEvent(event, callback) {
		this.on(event, callback);
	}

	enableButton(isEnable) {
		if (isEnable) {
			this.on('pointerdown', this.onCLick);
		}
		else {
			this.off('pointerdown', this.onCLick);
		}
		this.buttonMode = isEnable;
		this.interactive = isEnable;
	}

	onCLick() {
		let board = this.parent;

		if(board.canClick == false) {
			return;
		} 

		if (board.choosenBlock == null) {
			return;
		}

		if (this.children[0]) {
			if (this.children[0].isSuspend == true) {
				this.children[0].destroy();
			}
			else {
				return;
			}
		}

		if (this.children[0] == board.choosenBlock) {
			return;
		}

		let choosenBlock = board.choosenBlock;
		const ballX = choosenBlock.parent.index_X;
		const ballY = choosenBlock.parent.index_Y;
		const blockX = this.index_X;
		const blockY = this.index_Y;

		if (choosenBlock != null) {
			choosenBlock.playSpawn();
			board.recloneArrPath();
			if (board.findPath(choosenBlock.parent, this)) {
				board.recloneArrPath(board.arrBlocks_Value);
				board.arrBlocks_Value[blockY][blockX] = board.arrBlocks_Value[ballY][ballX];
				board.arrBlocks_Value[ballY][ballX] = 0;
				board.enableClick(false);
				
				board.choosenBlock.playMove();
				board.choosenBlock = null;
			}
			else {
				board.choosenBlock.playChosen();
				board.choosenBlock.clearPath();
			}
		}
	}
}

export default Block;