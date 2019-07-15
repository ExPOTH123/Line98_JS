import Board from "./Board";

class Block extends PIXI.Sprite {
	constructor() {
		super();
		this.texture = PIXI.Texture.from('data/image/bunny.png');

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

		if (board.choosenBlock == null) {
			return;
		}

		if (this.children[0]) {
			if (this.children[0].interactive == false) {
				this.children[0].destroy();
			}
			else {
				return;
			}
		}

		let choosenBlock = board.choosenBlock;
		const ballX = choosenBlock.parent.index_X;
		const ballY = choosenBlock.parent.index_Y;
		const blockX = this.index_X;
		const blockY = this.index_Y;

		if (choosenBlock != null) {
			choosenBlock.playSpawn();
			board.recloneArrPath();
			if (choosenBlock.parent != this && board.findPath(choosenBlock.parent, this)) {
				board.recloneArrPath(board.arrBlocks_Value);
				board.arrBlocks_Value[blockY][blockX] = board.arrBlocks_Value[ballY][ballX];
				board.arrBlocks_Value[ballY][ballX] = 0;
				board.choosenBlock.scale.x = board.choosenBlock.scale.x / board.choosenBlock.scaleWhenChosen;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y / board.choosenBlock.scaleWhenChosen;
				this.addChild(board.choosenBlock);

				board.choosenBlock = null;
				board.checkBlockAt(this, true);

				board.spawn();
			}
		}
	}
}

export default Block;