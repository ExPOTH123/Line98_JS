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
		for (let i = 1; i <= 6; i++) {
			const val = i <= 6 ? `${i}` : i;
			this.spawn_anim.push(PIXI.Texture.from(`data/image/ball/ball_spawn_${val}.png`));
		}

		this.isSuspend = true;
		this.color;

		this.isExploded = false;

		this.path = [];
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
		this.animationSpeed = GameDefine.BALL_EXPLODE_SPEED;
		this.loop = false;
		this.play();
		this.onComplete = function () { this.destroy(); };
	}

	playChosen() {
		this.textures = this.chosen_anim;
		this.animationSpeed = GameDefine.BALL_CHOSEN_SPEED;
		this.loop = true;
		this.play();
	}

	playSpawn() {
		this.textures = this.spawn_anim;
		this.animationSpeed = GameDefine.BALL_SPAWN_SPEED;
		this.loop = false;
		this.play();
		this.onComplete = function () {
			this.texture = this.idle_anim[0];
		};
	}

	playMove() {
		if (this.path.length - 1) {
			const vector_X = this.path[1].x - this.path[0].x;
			const vector_Y = this.path[1].y - this.path[0].y;
			console.log(this.x + " " + vector_X + " " + this.y + " " +  vector_Y);

			if (this.x == this.path[1].x && this.y == this.path[1].y) {
				this.path.shift();
			}
			else {
				this.x += vector_X / 5;
				this.y += vector_Y / 5;
			}

			requestAnimationFrame(()=>this.playMove());
			// const block = this.path.shift();
			// block.addChild(this);
			// this.textures = this.spawn_anim;
			// this.animationSpeed = GameDefine.BALL_MOVE_SPEED;
			// this.loop = false;
			// this.play();
			// this.onComplete = function () {
			// 	this.playMove();
			// };
		}
		else {
			const block = this.path.shift();
			this.x = this.y = 0;
			this.scale.x = this.scale.y = 1;
			block.addChild(this);

			this.onComplete = null;

			let board = this.parent.parent;
			board.checkBlockAt(this.parent, true);

			for (let i = 0; i < 2; i++) {
				board.spawn();
			}

			let gamestate = require('./GS_Ingame');
			gamestate.startTimer();

			board.enableClick(true);
		}

	}

	clearPath() {
		while (this.path.length) {
			this.path.pop();
		}
	}

	onCLick() {
		let board = this.parent.parent;

		if (board.canClick == false) {
			return;
		}

		this.playChosen();

		if (board.choosenBlock != null) {
			board.choosenBlock.playIdle();
			if (board.choosenBlock != this) {
				board.choosenBlock = this;
			}
			else {
				board.choosenBlock = null;
			}
		}
		else {
			board.choosenBlock = this;
		}
	}

}

export default Ball;