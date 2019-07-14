import Board from "./Board";

class Ball extends PIXI.extras.AnimatedSprite {
	constructor() {
		super([PIXI.Texture.from(`data/image/ball/ball.png`)]);
		this.idle_anim = [PIXI.Texture.from(`data/image/ball/ball.png`)];

		this.chosen_anim = [];
		for (let i = 1; i <= 7; i++) {
			const val = i <= 7 ? `${i}` : i;
			this.chosen_anim.push(PIXI.Texture.from(`data/image/ball/ball_chosen_${val}.png`));
		}

		this.explode_anim = [];
		for (let i = 1; i <= 7; i++) {
			const val = i <= 7 ? `${i}` : i;
			this.explode_anim.push(PIXI.Texture.from(`data/image/ball/ball_explode_${val}.png`));
		}

		this.spawn_anim = [];
		for (let i = 1; i <= 5; i++) {
			const val = i <= 5 ? `${i}` : i;
			this.spawn_anim.push(PIXI.Texture.from(`data/image/ball/ball_spawn_${val}.png`));
		}

		this.scaleWhenChosen = 1;
		this.color;

		this.isExploded = false;
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

	playIdle() {
		this.textures = this.idle_anim;
		this.loop = false;
		this.play();
	}

	playExplode() {
		this.textures = this.explode_anim;
		this.loop = false;
		this.play();
	}

	playChosen() {
		this.textures = this.chosen_anim;
		this.animationSpeed = 0.4;
		this.loop = true;
		this.play();
	}

	playSpawn() {
		this.textures = this.spawn_anim;
		this.animationSpeed = 0.4;
		this.loop = false;
		this.play();
	}

	onCLick() {
		this.playChosen();
		var board = this.parent.parent;
		for (var row = 0; row < GameDefine.ROW_NUM; row++) {
			for (var column = 0; column < GameDefine.COLUMN_NUM; column++) {
				board.arrBlocks[row][column].tint = 0xffffff;
			}
		}

		if (board.choosenBlock != null) {
			if (board.choosenBlock != this) {
				board.choosenBlock.playIdle();
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