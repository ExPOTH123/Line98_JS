import Board from "./Board";

class Block {
	constructor(spriteFrame, parent) {
		this.sprite = new PIXI.Sprite(spriteFrame);
		this.board = parent;
	}

	enableEvent(event, callback) {
		this.sprite.on(event, callback);
	}

	enableButton(isEnable) {
		if (isEnable) {
			this.sprite.on('pointerdown', this.onCLick);
		}
		else {
			this.sprite.off('pointerdown', this.onCLick);
		}
		this.sprite.buttonMode = isEnable;
		this.sprite.interactive = isEnable;
	}

	onCLick() {
		let board = this.parent;

		if (this.children[0] || board.choosenBlock == null) {
			return;
		}
		
		var choosenBlock = board.choosenBlock;
		const ballX = Math.floor(choosenBlock.parent.x / choosenBlock.parent.width);
		const ballY = Math.floor(choosenBlock.parent.y / choosenBlock.parent.height);
		const blockX = Math.floor(this.x / this.width);
		const blockY = Math.floor(this.y / this.height);

		if (choosenBlock != null) {
			board.RecloneArrPath();
			if (choosenBlock.parent != this && board.FindPath(choosenBlock.parent, this)) {
				console.log(board.arrBlocks_Value);
				board.RecloneArrPath(board.arrBlocks_Value);
				board.arrBlocks_Value[blockY][blockX] = board.arrBlocks_Value[ballY][ballX];
				board.arrBlocks_Value[ballY][ballX] = 0;
				board.choosenBlock.scale.x = board.choosenBlock.scale.x / 1.1;
				board.choosenBlock.scale.y = board.choosenBlock.scale.y / 1.1;
				this.addChild(board.choosenBlock);
				board.choosenBlock = null;
				board.Spawn();
				board.CheckBlockAt(this, true);
			}
		}
	}
}

export default Block;