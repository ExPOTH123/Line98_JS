import Ball from "../game/Ball.js";
import Block from "../game/Block.js";

class Board extends PIXI.Container {
	constructor() {
		super();

		this.bunnyWidth = GameConfig.width / GameDefine.COLUMN_NUM - GameDefine.OUT_LINE;
		this.bunnyHeight = this.bunnyWidth;

		this.arrBlocks = new Array(GameDefine.ROW_NUM);
		this.arrBlocks_Value = new Array(GameDefine.ROW_NUM);
		this.arrBlocks_Path = new Array(GameDefine.ROW_NUM);

		this.ballAboutToSpawn = new Array(GameDefine.BALL_PER_SPAWN);
		this.stepsCount = 0;
		this.isCanSpawn = true;

		this.timeToSpawn = 2;
		this.timeCount = 0;
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
				block.x = column * block.width + block.width / 2 + (column + 1) * GameDefine.OUT_LINE;
				block.y = row * block.height + block.height / 2 + row * GameDefine.OUT_LINE;
				block.index_X = column;
				block.index_Y = row;

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

			let indexToSpawn = new Array(GameDefine.BALL_PER_SPAWN);

			// Random index
			for (let i = 0; i < indexToSpawn.length; i++) {
				indexToSpawn[i] = Math.random() * (maxBlockNum - 1); // 0-99
				indexToSpawn[i] = Math.round(indexToSpawn[i]); // 0-99

				// Normalize the random
				for (let j = 0; j < indexToSpawn.length; j++) {
					if (i != j && indexToSpawn[i] == indexToSpawn[j]) {
						indexToSpawn[j]++;
					}
				}

				// Spawn
				let realIndex_Row = Math.floor(indexToSpawn[i] / GameDefine.COLUMN_NUM);
				let realIndex_Columns = Math.floor(indexToSpawn[i] % GameDefine.COLUMN_NUM);
				let failCount = 0;
				while (this.arrBlocks[realIndex_Row][realIndex_Columns].children.length) {
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

				let colorIndex = this.randomColor(); // Random color
				let block = this.arrBlocks[realIndex_Row][realIndex_Columns];
				let newBall = this.spawnBall(block, GameDefine.COLOR[colorIndex]);

				// Set new ball to suspend mode
				if (this.isStartGame) {
					newBall.scale.x = 0.3;
					newBall.scale.y = 0.3;
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
		for (let i = 0; i < GameDefine.BALL_PER_SPAWN; i++) {
			if (this.ballAboutToSpawn[i]) {
				let block = this.ballAboutToSpawn[i].parent;
				if (block) {
					this.ballAboutToSpawn[i].scale.x = 1;
					this.ballAboutToSpawn[i].scale.y = 1;
					this.ballAboutToSpawn[i].enableButton(true);
					this.ballAboutToSpawn[i].playSpawn();

					const currentColumn = block.index_X;
					const currentRow = block.index_Y;
					this.arrBlocks_Value[currentRow][currentColumn] = this.ballAboutToSpawn[i].color + 1;
					this.checkBlockAt(block, true);
					this.ballAboutToSpawn[i] = null;
				}
			}
		}
		this.isCanSpawn = true;
	}

	randomColor() {
		let result = Math.floor(Math.random() * (Object.keys(GameDefine.COLOR).length));

		return result;
	}

	spawnBall(block, color) {
		let ball = new Ball();
		ball.anchor.set(0.5, 0.5);
		ball.tint = color;

		ball.enableButton(true);
		block.addChild(ball);

		return ball;
	}

	checkBlockAt(block, isClean) {
		const currentColumn = block.index_X;
		const currentRow = block.index_Y;

		let isScore = false;
		isScore = this.checkPlus(block, isClean) || isScore;
		isScore = this.checkCross(block, isClean) || isScore;

		if (isScore) { // chosen block
			this.arrBlocks_Value[currentRow][currentColumn] = 0;
			this.arrBlocks[currentRow][currentColumn].children[0].playExplode();
			this.arrBlocks[currentRow][currentColumn].children[0].enableButton(false);
		}

		return isScore;
	}

	// Check +
	checkPlus(block, isClean, isCross) {
		const currentColumn = block.index_X;
		const currentRow = block.index_Y;

		let colorToCheck = this.arrBlocks_Value[currentRow][currentColumn];

		// Check up
		let matchCount_Up = 0;
		let up = currentRow;
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
		let matchCount_Down = 0;
		let down = currentRow;
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
		let matchCount_Left = 0;
		let left = currentColumn;
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
		let matchCount_Right = 0;
		let right = currentColumn;
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
				for (let i = 1; i < matchCount_Up; i++) {
					this.explodeBall(currentRow - i, currentColumn);
				}

				for (let i = 1; i < matchCount_Down; i++) {
					this.explodeBall(currentRow + i, currentColumn);
				}
			}

			// Clean if >= 5 matches
			if (matchCount_Left + matchCount_Right - 1 >= 5) {
				for (let i = 1; i < matchCount_Left; i++) {
					this.explodeBall(currentRow, currentColumn - i);
				}

				for (let i = 1; i < matchCount_Right; i++) {
					this.explodeBall(currentRow, currentColumn + i);
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
		const currentColumn = block.index_X;
		const currentRow = block.index_Y;

		let colorToCheck = this.arrBlocks_Value[currentRow][currentColumn];

		// Check up left
		let matchCount_UpLeft = 0;
		let up = currentRow;
		let left = currentColumn;
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
		let matchCount_DownRight = 0;
		let down = currentRow;
		let right = currentColumn;
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
		let matchCount_UpRight = 0;
		up = currentRow;
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
		let matchCount_DownLeft = 0;
		down = currentRow;
		left = currentColumn;
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
				for (let i = 1; i < matchCount_UpLeft; i++) {
					this.explodeBall(currentRow - i, currentColumn - i);
				}

				for (let i = 1; i < matchCount_DownRight; i++) {
					this.explodeBall(currentRow + i, currentColumn + i);
				}
			}

			// Clean if >= 5 matches
			if (matchCount_UpRight + matchCount_DownLeft - 1 >= 5) {
				for (let i = 1; i < matchCount_UpRight; i++) {
					this.explodeBall(currentRow - i, currentColumn + i);
				}

				for (let i = 1; i < matchCount_DownLeft; i++) {
					this.explodeBall(currentRow + i, currentColumn - i);
				}
			}
		}


		if (matchCount_UpLeft + matchCount_DownRight - 1 >= 5 || matchCount_UpRight + matchCount_DownLeft - 1 >= 5) {
			return true;
		}

		return false;
	}

	explodeBall(row, column) {
		this.arrBlocks_Value[row][column] = 0;
		this.arrBlocks[row][column].children[0].playExplode();
		this.arrBlocks[row][column].children[0].enableButton(false);
	}

	findPath(A, B) {
		const currentColumn_A = A.index_X;
		const currentRow_A = A.index_Y;
		const currentColumn_B = B.index_X;
		const currentRow_B = B.index_Y;

		if (A == B) {
			this.arrBlocks[currentRow_A][currentColumn_A].tint = GameDefine.COLOR[0];
			return true;
		}

		this.arrBlocks[currentRow_A][currentColumn_A].tint = GameDefine.COLOR[0];

		let sideToGo = [];
		if (currentRow_A - 1 >= 0) { // check up side
			if (this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A - 1);
				const vectorAB_Y = currentColumn_B - (currentColumn_A);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 1);
			}
		}
		if (currentRow_A + 1 < GameDefine.ROW_NUM) { // check down side
			if (this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A + 1);
				const vectorAB_Y = currentColumn_B - (currentColumn_A);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 2);
			}
		}
		if (currentColumn_A - 1 >= 0) { // check left side
			if (this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A);
				const vectorAB_Y = currentColumn_B - (currentColumn_A - 1);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 3);
			}
		}
		if (currentColumn_A + 1 < GameDefine.COLUMN_NUM) { // check right side
			if (this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A);
				const vectorAB_Y = currentColumn_B - (currentColumn_A + 1);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 4);
			}
		}

		sideToGo.sort(function (a, b) { return b % 1 - a % 1 });

		let isCanFindPath = false;
		let nextStep;
		let numOfStep = sideToGo.length;
		for (let i = 0; i < numOfStep; i++) {
			nextStep = Math.floor(sideToGo.pop());

			if (nextStep == 1) { // up
				if (this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] == 0) {
					this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A - 1][currentColumn_A], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A - 1][currentColumn_A].tint = 0xffffff;
				}
			}
			else if (nextStep == 2) { // down
				if (this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] == 0) {
					this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A + 1][currentColumn_A], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A + 1][currentColumn_A].tint = 0xffffff;
				}
			}
			else if (nextStep == 3) { // left
				if (this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] == 0) {
					this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] = 1;
					isCanFindPath = this.findPath(this.arrBlocks[currentRow_A][currentColumn_A - 1], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A][currentColumn_A - 1].tint = 0xffffff;
				}
			}
			else if (nextStep == 4) { // right
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
		for (let row = 0; row < GameDefine.ROW_NUM; row++) {
			for (let column = 0; column < GameDefine.COLUMN_NUM; column++) {
				this.arrBlocks_Path[row][column] = this.arrBlocks_Value[row][column] != 0;
			}
		}
	}
}
export default Board;