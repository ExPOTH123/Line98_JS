import Ball from "../game/Ball.js";
import Block from "../game/Block.js";

class Board extends PIXI.Container {
	constructor() {
		super();

		this.bunnyWidth = GameConfig.width / GameDefine.COLUMN_NUM;
		this.bunnyHeight = this.bunnyWidth;

		this.arrBlocks = new Array(GameDefine.ROW_NUM);
		this.arrBlocks_Value = new Array(GameDefine.ROW_NUM);
		this.arrBlocks_Path = new Array(GameDefine.ROW_NUM);

		this.ballAboutToSpawn = new Array(GameDefine.BALL_PER_SPAWN);
		this.stepsCount = 0;
		this.isCanSpawn = true;
		this.ballsToDestroy = [];

		this.timeToSpawn = 2;
		this.timeCount = 0;
		this.Color = [0xff0000, 0xbfff00, 0x0080ff];
		this.choosenBlock = null;

		this.isGameOver = false;
		this.isStartGame = false;
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	load() {
		for (let row = 0; row < GameDefine.ROW_NUM; row++) {
			this.arrBlocks[row] = new Array(GameDefine.COLUMN_NUM);
			this.arrBlocks_Value[row] = new Array(GameDefine.COLUMN_NUM);
			this.arrBlocks_Path[row] = new Array(GameDefine.COLUMN_NUM);

			for (let column = 0; column < GameDefine.COLUMN_NUM; column++) {
				const block = new Block();
				block.anchor.set(0.5, 0.5);
				block.width = this.bunnyWidth;
				block.height = this.bunnyHeight;
				block.x = column * block.width + block.width / 2;
				block.y = row * block.height + block.height / 2;

				// Pointers normalize touch and mouse
				block.enableButton(true);

				this.addChild(block);

				this.arrBlocks[row][column] = block;
				this.arrBlocks_Value[row][column] = 0;
				this.arrBlocks_Path[row][column] = 0;
			}
		}
	}

	spawn() {
		this.stepsCount++;

		if (this.stepsCount % GameDefine.STEPS_TO_SPAWN) {
			if (!this.isCanSpawn) {
				return true;;
			}
			this.isCanSpawn = false;
			const maxBlockNum = GameDefine.ROW_NUM * GameDefine.COLUMN_NUM;

			var indexToSpawn = new Array(GameDefine.BALL_PER_SPAWN);

			// Random index
			for (var i = 0; i < indexToSpawn.length; i++) {
				indexToSpawn[i] = Math.random() * (maxBlockNum - 1); // 0-99
				indexToSpawn[i] = Math.round(indexToSpawn[i]); // 0-99

				// Normalize the random
				for (var j = 0; j < indexToSpawn.length; j++) {
					if (i != j && indexToSpawn[i] == indexToSpawn[j]) {
						indexToSpawn[j]++;
					}
				}

				// Spawn
				var realIndex_Row = Math.floor(indexToSpawn[i] / GameDefine.COLUMN_NUM);
				var realIndex_Columns = Math.floor(indexToSpawn[i] % GameDefine.COLUMN_NUM);
				var failCount = 0;
				while (this.arrBlocks_Value[realIndex_Row][realIndex_Columns] != 0) {
					indexToSpawn[i]++;
					if (indexToSpawn[i] >= maxBlockNum) {
						failCount++;
						if (failCount > 2) {
							this.isGameOver = true;
							return false;
						}
						indexToSpawn[i] -= maxBlockNum;
					}
					realIndex_Row = Math.floor(indexToSpawn[i] / GameDefine.COLUMN_NUM);
					realIndex_Columns = Math.floor(indexToSpawn[i] % GameDefine.COLUMN_NUM);
				}

				var colorIndex = this.randomColor(); // Random color
				var block = this.arrBlocks[realIndex_Row][realIndex_Columns];
				var newBall = this.spawnBall(block, this.Color[colorIndex]);

				// Set new ball to suspend mode
				if (this.isStartGame) {
					newBall.width = block.width / 4;
					newBall.height = block.height / 4;
					newBall.enableButton(false);
				}
				else { // If it's first spawn
					this.isCanSpawn = true;
					this.stepsCount = 0;
					this.arrBlocks_Value[realIndex_Row][realIndex_Columns] = colorIndex + 1;
				}

				newBall.color = colorIndex;
				this.ballAboutToSpawn[i] = newBall;
			}
		}
		else {
			this.enableSuspendedBall();
		}

		this.isStartGame = true;

		return true;
	}

	enableSuspendedBall() {
		this.stepsCount = 0;
		for (var i = 0; i < GameDefine.BALL_PER_SPAWN; i++) {
			var block = this.ballAboutToSpawn[i].parent;
			if (block) {
				this.ballAboutToSpawn[i].width = this.bunnyWidth / 2;
				this.ballAboutToSpawn[i].height = this.bunnyHeight / 2;
				this.ballAboutToSpawn[i].enableButton(true);
				this.ballAboutToSpawn[i].playSpawn();

				const currentColumn = Math.floor(block.x / block.width);
				const currentRow = Math.floor(block.y / block.height);
				this.arrBlocks_Value[currentRow][currentColumn] = this.ballAboutToSpawn[i].color + 1;
				this.checkBlockAt(block, true);
			}
		}
		this.isCanSpawn = true;
	}

	randomColor() {
		var result = Math.floor(Math.random() * (Object.keys(this.Color).length));

		return result;
	}

	spawnBall(block, color) {
		var ball = new Ball();
		ball.anchor.set(0.5, 0.5);
		ball.width = block.width / 2;
		ball.height = block.height / 2;
		ball.tint = color;

		ball.enableButton(true);
		block.addChild(ball);

		return ball;
	}

	checkBlockAt(block, isClean) {
		const currentColumn = Math.floor(block.x / block.width);
		const currentRow = Math.floor(block.y / block.height);

		var isScore = false;
		isScore = isScore || this.checkPlus(block, isClean);
		isScore = isScore || this.checkCross(block, isClean);

		if (isScore) {
			this.arrBlocks_Value[currentRow][currentColumn] = 0;
			this.ballsToDestroy.push(this.arrBlocks[currentRow][currentColumn].children[0])
			this.arrBlocks[currentRow][currentColumn].children[0].playExplode();
			this.arrBlocks[currentRow][currentColumn].children[0].enableButton(false);
		}

		return isScore;
	}

	// Check +
	checkPlus(block, isClean) {
		const currentColumn = Math.floor(block.x / block.width);
		const currentRow = Math.floor(block.y / block.height);

		var colorToCheck = this.arrBlocks_Value[currentRow][currentColumn];

		// Check up
		var matchCount_Up = 0;
		var matchCount_Down = 0;
		var up = currentRow;
		var down = currentRow;
		while (up >= 0) {
			if (this.arrBlocks_Value[up][currentColumn] == colorToCheck) {
				matchCount_Up++;
			}
			else {
				break;
			}
			up--;
		}

		// Check up
		while (down < GameDefine.ROW_NUM) {
			if (this.arrBlocks_Value[down][currentColumn] == colorToCheck) {
				matchCount_Down++;
			}
			else {
				break;
			}
			down++;
		}

		// Check left
		var matchCount_Left = 0;
		var matchCount_Right = 0;
		var left = currentColumn;
		var right = currentColumn;
		while (left >= 0) {
			if (this.arrBlocks_Value[currentRow][left] == colorToCheck) {
				matchCount_Left++;
			}
			else {
				break;
			}
			left--;
		}

		// Check right
		while (right < GameDefine.COLUMN_NUM) {
			if (this.arrBlocks_Value[currentRow][right] == colorToCheck) {
				matchCount_Right++;
			}
			else {
				break;
			}
			right++;
		}

		if (isClean) {
			// Clean if >= 5 matches
			if (matchCount_Up + matchCount_Down - 1 >= 5) {
				for (var i = 1; i < matchCount_Up; i++) {
					this.arrBlocks_Value[currentRow - i][currentColumn] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow - i][currentColumn].children[0])
					this.arrBlocks[currentRow - i][currentColumn].children[0].playExplode();
					this.arrBlocks[currentRow - i][currentColumn].children[0].enableButton(false);
				}

				for (var i = 1; i < matchCount_Down; i++) {
					this.arrBlocks_Value[currentRow + i][currentColumn] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow + i][currentColumn].children[0])
					this.arrBlocks[currentRow + i][currentColumn].children[0].playExplode();
					this.arrBlocks[currentRow + i][currentColumn].children[0].enableButton(false);
				}
			}

			// Clean if >= 5 matches
			if (matchCount_Left + matchCount_Right - 1 >= 5) {
				for (var i = 1; i < matchCount_Left; i++) {
					this.arrBlocks_Value[currentRow][currentColumn - i] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow][currentColumn - i].children[0])
					this.arrBlocks[currentRow][currentColumn - i].children[0].playExplode();
					this.arrBlocks[currentRow][currentColumn - i].children[0].enableButton(false);
				}

				for (var i = 1; i < matchCount_Right; i++) {
					this.arrBlocks_Value[currentRow][currentColumn + i] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow][currentColumn + i].children[0])
					this.arrBlocks[currentRow][currentColumn + i].children[0].playExplode();
					this.arrBlocks[currentRow][currentColumn + i].children[0].enableButton(false);
				}
			}
		}


		if (matchCount_Left + matchCount_Right - 1 >= 5 || matchCount_Up + matchCount_Down - 1 >= 5) {
			return true;
		}

		return false;
	}

	// Check X
	checkCross(block, isClean) {
		const currentColumn = Math.floor(block.x / block.width);
		const currentRow = Math.floor(block.y / block.height);

		var colorToCheck = this.arrBlocks_Value[currentRow][currentColumn];

		var matchCount_UpLeft = 0;
		var matchCount_DownRight = 0;
		var up = currentRow;
		var down = currentRow;
		var left = currentColumn;
		var right = currentColumn;
		// Check up left
		while (up >= 0 && left >= 0) {
			if (this.arrBlocks_Value[up][left] == colorToCheck) {
				matchCount_UpLeft++;
			}
			else {
				break;
			}
			up--;
			left--;
		}

		// Check down right
		while (down < GameDefine.ROW_NUM && right < GameDefine.COLUMN_NUM) {
			if (this.arrBlocks_Value[down][right] == colorToCheck) {
				matchCount_DownRight++;
			}
			else {
				break;
			}
			down++;
			right++;
		}

		// Check up down
		var matchCount_UpRight = 0;
		var matchCount_DownLeft = 0;
		up = currentRow;
		down = currentRow;
		left = currentColumn;
		right = currentColumn;
		while (up >= 0 && right < GameDefine.COLUMN_NUM) {
			if (this.arrBlocks_Value[up][right] == colorToCheck) {
				matchCount_UpRight++;
			}
			else {
				break;
			}
			up--;
			right++;
		}

		// Check down left
		while (down < GameDefine.ROW_NUM && left >= 0) {
			if (this.arrBlocks_Value[down][left] == colorToCheck) {
				matchCount_DownLeft++;
			}
			else {
				break;
			}
			down++;
			left--;
		}

		if (isClean) {
			// Clean if >= 5 matches
			if (matchCount_UpLeft + matchCount_DownRight - 1 >= 5) {
				for (var i = 1; i < matchCount_UpLeft; i++) {
					this.arrBlocks_Value[currentRow - i][currentColumn - i] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow - i][currentColumn - i].children[0])
					this.arrBlocks[currentRow - i][currentColumn - i].children[0].playExplode();
					this.arrBlocks[currentRow - i][currentColumn - i].children[0].enableButton(false);
				}

				for (var i = 1; i < matchCount_DownRight; i++) {
					this.arrBlocks_Value[currentRow + i][currentColumn + i] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow + i][currentColumn + i].children[0])
					this.arrBlocks[currentRow + i][currentColumn + i].children[0].playExplode();
					this.arrBlocks[currentRow + i][currentColumn + i].children[0].enableButton(false);
				}
			}

			// Clean if >= 5 matches
			if (matchCount_UpRight + matchCount_DownLeft - 1 >= 5) {
				for (var i = 1; i < matchCount_UpRight; i++) {
					this.arrBlocks_Value[currentRow - i][currentColumn + i] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow - i][currentColumn + i].children[0])
					this.arrBlocks[currentRow - i][currentColumn + i].children[0].playExplode();
					this.arrBlocks[currentRow - i][currentColumn + i].children[0].enableButton(false);
				}

				for (var i = 1; i < matchCount_DownLeft; i++) {
					this.arrBlocks_Value[currentRow + i][currentColumn - i] = 0;
					this.ballsToDestroy.push(this.arrBlocks[currentRow + i][currentColumn - i].children[0])
					this.arrBlocks[currentRow + i][currentColumn - i].children[0].playExplode();
					this.arrBlocks[currentRow + i][currentColumn - i].children[0].enableButton(false);
				}
			}
		}


		if (matchCount_UpLeft + matchCount_DownRight - 1 >= 5 || matchCount_UpRight + matchCount_DownLeft - 1 >= 5) {
			return true;
		}

		return false;
	}

	findPath(A, B) {
		const currentColumn_A = Math.floor(A.x / A.width);
		const currentRow_A = Math.floor(A.y / A.height);
		const currentColumn_B = Math.floor(B.x / B.width);
		const currentRow_B = Math.floor(B.y / B.height);
		if (A == B) {
			this.arrBlocks[currentRow_A][currentColumn_A].tint = this.Color[0];
			return true;
		}

		this.arrBlocks[currentRow_A][currentColumn_A].tint = this.Color[0];

		var sideToGo = [];
		if (currentRow_A - 1 >= 0) {
			if (this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A - 1);
				const vectorAB_Y = currentColumn_B - (currentColumn_A);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 1);
			}
		}
		if (currentRow_A + 1 < GameDefine.ROW_NUM) {
			if (this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A + 1);
				const vectorAB_Y = currentColumn_B - (currentColumn_A);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 2);
			}
		}
		if (currentColumn_A - 1 >= 0) {
			if (this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A);
				const vectorAB_Y = currentColumn_B - (currentColumn_A - 1);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 3);
			}
		}
		if (currentColumn_A + 1 < GameDefine.COLUMN_NUM) {
			if (this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A);
				const vectorAB_Y = currentColumn_B - (currentColumn_A + 1);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 4);
			}
		}

		sideToGo.sort(function (a, b) { return b % 1 - a % 1 });

		var isCanFindPath = false;
		var nextStep;
		var numOfStep = sideToGo.length;
		for (var i = 0; i < numOfStep; i++) {
			nextStep = Math.floor(sideToGo.pop());

			if (nextStep == 1) {
				if (this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] == 0) {
					this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A - 1][currentColumn_A], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A - 1][currentColumn_A].tint = 0xffffff;
				}
			}
			else if (nextStep == 2) {
				if (this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] == 0) {
					this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A + 1][currentColumn_A], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A + 1][currentColumn_A].tint = 0xffffff;
				}
			}
			else if (nextStep == 3) {
				if (this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] == 0) {
					this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A][currentColumn_A - 1], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A][currentColumn_A - 1].tint = 0xffffff;
				}
			}
			else if (nextStep == 4) {
				if (this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] == 0) {
					this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A][currentColumn_A + 1], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A][currentColumn_A + 1].tint = 0xffffff;
				}
			}
		}

		return isCanFindPath;
	}

	recloneArrPath() {
		for (var row = 0; row < GameDefine.ROW_NUM; row++) {
			for (var column = 0; column < GameDefine.COLUMN_NUM; column++) {
				this.arrBlocks_Path[row][column] = this.arrBlocks_Value[row][column] != 0;
			}
		}
	}

	Update(deltaTime) {
		if(this.ballsToDestroy.length) {
			if(this.ballsToDestroy[this.ballsToDestroy.length - 1].playing == false) {
				var last = this.ballsToDestroy.pop();
				last.destroy();
			}
		}
	}
}
export default Board;