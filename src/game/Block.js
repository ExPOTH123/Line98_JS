import Board from "./Board";

class Block extends PIXI.Sprite {
	constructor() {
		super();
		this.texture = PIXI.Texture.from('data/image/bunny.png');
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
			if(this.children[0].interactive == false) {
				this.children[0].destroy();
			}
			else {
				return;
			}
		}
		
		var choosenBlock = board.choosenBlock;
		choosenBlock.playSpawn();
		const ballX = Math.floor(choosenBlock.parent.x / choosenBlock.parent.width);
		const ballY = Math.floor(choosenBlock.parent.y / choosenBlock.parent.height);
		const blockX = Math.floor(this.x / this.width);
		const blockY = Math.floor(this.y / this.height);

		if (choosenBlock != null) {
			board.recloneArrPath();
		if (choosenBlock.parent != this && board.findPath(choosenBlock.parent, this)) {
				board.recloneArrPath(board.arrBlocks_Value);
				board.arrBlocks_Value[blockY][blockX] = board.arrBlocks_Value[ballY][ballX];
				board.arrBlocks_Value[ballY][ballX] = 0;
				board.choosenBlock.scale.x = board.choosenBlock.scale.x / board.choosenBlock.scaleWhenChosen;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y / board.choosenBlock.scaleWhenChosen;
				this.addChild(board.choosenBlock);

				board.choosenBlock = null;

				board.spawn();
				
				board.checkBlockAt(this, true);
			}
		}
	}
}

export default Block;