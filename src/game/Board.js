class Board extends PIXI.Container {
	constructor() {
		super();
		// Create a new texture
		this.textureBlock = PIXI.Texture.from('data/image/bunny.png');
		this.textureBall = PIXI.Texture.from('data/image/ball.png');

		this.rowNum = 10;
		this.columnNum = 10;
		this.bunnyWidth = GameConfig.width / this.columnNum;
		this.bunnyHeight = this.bunnyWidth;

		this.arrBlocks = new Array(this.rowNum);
		this.arrBlocks_Value = new Array(this.rowNum);
		this.arrBlocks_Path = new Array(this.rowNum);
		this.ballNumPerSpawn = 3;
		this.timeToSpawn = 2;
		this.timeCount = 0;
		this.Color = [0xff0000, 0xbfff00, 0x0080ff];
		this.choosenBlock = null;

		this.isGameOver = false;
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

	Load() {
		for (let row = 0; row < this.rowNum; row++) {
			this.arrBlocks[row] = new Array(this.columnNum);
			this.arrBlocks_Value[row] = new Array(this.columnNum);
			this.arrBlocks_Path[row] = new Array(this.columnNum);

			for (let column = 0; column < this.columnNum; column++) {
				const bunny = new PIXI.Sprite(this.textureBlock);
				bunny.anchor.set(0.5, 0.5);
				bunny.width = this.bunnyWidth;
				bunny.height = this.bunnyHeight;
				bunny.x = column * bunny.width + bunny.width / 2;
				bunny.y = row * bunny.height + bunny.height / 2;

				// make the button interactive...

				// Pointers normalize touch and mouse
				bunny.on('pointerdown', this.onBlockClick);

				this.addChild(bunny);
				bunny.buttonMode = true;
				bunny.interactive = true;

				this.arrBlocks[row][column] = bunny;
				this.arrBlocks_Value[row][column] = 0;
				this.arrBlocks_Path[row][column] = 0;
			}
		}
	}

	Spawn() {
		const maxBlockNum = this.rowNum * this.columnNum;

		var indexToSpawn = new Array(this.ballNumPerSpawn);

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
			var realIndex_Row = Math.floor(indexToSpawn[i] / this.columnNum);
			var realIndex_Columns = Math.floor(indexToSpawn[i] % this.columnNum);
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
				realIndex_Row = Math.floor(indexToSpawn[i] / this.columnNum);
				realIndex_Columns = Math.floor(indexToSpawn[i] % this.columnNum);
			}

			var colorIndex = Math.floor(Math.random() * (Object.keys(this.Color).length)); // Random color
			var block = this.arrBlocks[realIndex_Row][realIndex_Columns];
			const ball = new PIXI.Sprite(this.textureBall);
			ball.anchor.set(0.5, 0.5);
			ball.width = block.width / 2;
			ball.height = block.height / 2;
			// ball.x = block.x;
			// ball.y = block.y;
			ball.tint = this.Color[colorIndex];
			block.addChild(ball);

			ball.on('pointerdown', this.onBallClick);
			ball.buttonMode = true;
			ball.interactive = true;

			this.arrBlocks_Value[realIndex_Row][realIndex_Columns] = colorIndex + 1;
			this.CheckBlockAt(block, true);
		}

		return true;
	}

	onBallClick() {
		for (var row = 0; row < this.parent.parent.rowNum; row++) {
			for (var column = 0; column < this.parent.parent.columnNum; column++) {
				this.parent.parent.arrBlocks[row][column].tint = 0xffffff;
			}
		}

		if (this.parent.parent.choosenBlock != null) {
			if (this.parent.parent.choosenBlock != this) {
				this.parent.parent.choosenBlock.scale.x = this.parent.parent.choosenBlock.scale.x / 1.1;
				this.parent.parent.choosenBlock.scale.y = this.parent.parent.choosenBlock.scale.y / 1.1;

				this.parent.parent.choosenBlock = this;
				this.parent.parent.choosenBlock.scale.x = this.parent.parent.choosenBlock.scale.x * 1.1;
				this.parent.parent.choosenBlock.scale.y = this.parent.parent.choosenBlock.scale.y * 1.1;
			}
		}
		else {
			this.parent.parent.choosenBlock = this;
			this.parent.parent.choosenBlock.scale.x = this.parent.parent.choosenBlock.scale.x * 1.1;
			this.parent.parent.choosenBlock.scale.y = this.parent.parent.choosenBlock.scale.y * 1.1;
		}
	}

	onBlockClick() {
		if (this.children[0] || this.parent.choosenBlock == null) {
			return;
		}
		var choosenBlock = this.parent.choosenBlock;
		const ballX = Math.floor(choosenBlock.parent.x / choosenBlock.parent.width);
		const ballY = Math.floor(choosenBlock.parent.y / choosenBlock.parent.height);
		const blockX = Math.floor(this.x / this.width);
		const blockY = Math.floor(this.y / this.height);

		if (choosenBlock != null) {
			this.parent.RecloneArrPath();
			if (choosenBlock.parent != this && this.parent.FindPath(choosenBlock.parent, this)) {
				this.parent.RecloneArrPath();
				this.parent.arrBlocks_Value[blockY][blockX] = this.parent.arrBlocks_Value[ballY][ballX];
				this.parent.arrBlocks_Value[ballY][ballX] = 0;
				this.parent.choosenBlock.scale.x = this.parent.choosenBlock.scale.x / 1.1;
				this.parent.choosenBlock.scale.y = this.parent.choosenBlock.scale.y / 1.1;
				this.addChild(this.parent.choosenBlock);
				this.parent.choosenBlock = null;
				this.parent.Spawn();
				this.parent.CheckBlockAt(this, true);
			}
		}
	}

	CheckBlockAt(block, isClean) {
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
		while (down < this.rowNum) {
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
		while (right < this.columnNum) {
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
					this.arrBlocks[currentRow - i][currentColumn].children[0].destroy();
				}

				for (var i = 1; i < matchCount_Down; i++) {
					this.arrBlocks_Value[currentRow + i][currentColumn] = 0;
					this.arrBlocks[currentRow + i][currentColumn].children[0].destroy();
				}
			}

			// Clean if >= 5 matches
			if (matchCount_Left + matchCount_Right - 1 >= 5) {
				for (var i = 1; i < matchCount_Left; i++) {
					this.arrBlocks_Value[currentRow][currentColumn - i] = 0;
					this.arrBlocks[currentRow][currentColumn - i].children[0].destroy();
				}

				for (var i = 1; i < matchCount_Right; i++) {
					this.arrBlocks_Value[currentRow][currentColumn + i] = 0;
					this.arrBlocks[currentRow][currentColumn + i].children[0].destroy();
				}
			}

			if (matchCount_Left + matchCount_Right - 1 >= 5 || matchCount_Up + matchCount_Down - 1 >= 5) {
				this.arrBlocks_Value[currentRow][currentColumn] = 0;
				this.arrBlocks[currentRow][currentColumn].children[0].destroy();
			}
		}


		if (matchCount_Left + matchCount_Right - 1 >= 5 || matchCount_Up + matchCount_Down - 1 >= 5) {
			return true;
		}

		return false;
	}

	FindPath(A, B) {
		const currentColumn_A = Math.floor(A.x / A.width);
		const currentRow_A = Math.floor(A.y / A.height);
		const currentColumn_B = Math.floor(B.x / B.width);
		const currentRow_B = Math.floor(B.y / B.height);
		if (A == B) {
			console.log('---------------------------------');

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
		if (currentRow_A + 1 < this.rowNum) {
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
		if (currentColumn_A + 1 < this.columnNum) {
			if (this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] == 0) {
				const vectorAB_X = currentRow_B - (currentRow_A);
				const vectorAB_Y = currentColumn_B - (currentColumn_A + 1);
				const distance = Math.sqrt(vectorAB_X * vectorAB_X + vectorAB_Y * vectorAB_Y);
				sideToGo.push(distance / (Math.floor(distance / 10) + 1) / 10 + 4);
			}
		}

		sideToGo.sort(function (a, b) { return b % 1 - a % 1 });

		console.log(sideToGo);

		var isCanFindPath = false;
		var nextStep;
		var numOfStep = sideToGo.length;
		for(var i = 0; i < numOfStep; i++) {
			nextStep = Math.floor(sideToGo.pop());
			console.log(nextStep);

			if (nextStep == 1) {
				if (this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] == 0) {
					this.arrBlocks_Path[currentRow_A - 1][currentColumn_A] = 1;
					isCanFindPath = this.FindPath(this.arrBlocks[currentRow_A - 1][currentColumn_A], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}
					
					this.arrBlocks[currentRow_A - 1][currentColumn_A].tint = 0xffffff;
				}
			}
			else if (nextStep == 2) {
				if (this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] == 0) {
					this.arrBlocks_Path[currentRow_A + 1][currentColumn_A] = 1;
					isCanFindPath = this.FindPath(this.arrBlocks[currentRow_A + 1][currentColumn_A], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A + 1][currentColumn_A].tint = 0xffffff;
				}
			}
			else if (nextStep == 3) {
				if (this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] == 0) {
					this.arrBlocks_Path[currentRow_A][currentColumn_A - 1] = 1;
					isCanFindPath = this.FindPath(this.arrBlocks[currentRow_A][currentColumn_A - 1], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A][currentColumn_A - 1].tint = 0xffffff;
				}
			}
			else if (nextStep == 4) {
				if (this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] == 0) {
					this.arrBlocks_Path[currentRow_A][currentColumn_A + 1] = 1;
					isCanFindPath = this.FindPath(this.arrBlocks[currentRow_A][currentColumn_A + 1], B)
					if (isCanFindPath) {
						return isCanFindPath;
					}

					this.arrBlocks[currentRow_A][currentColumn_A + 1].tint = 0xffffff;
				}
			}
		}

		return isCanFindPath;
	}

	RecloneArrPath() {
		for (var row = 0; row < this.rowNum; row++) {
			for (var column = 0; column < this.columnNum; column++) {
				this.arrBlocks_Path[row][column] = this.arrBlocks_Value[row][column] != 0;
			}
		}
	}
}
export default Board;