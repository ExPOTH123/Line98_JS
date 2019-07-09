const app = new PIXI.Application({
    width: 400, height: 400, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const textureBlock = PIXI.Texture.from('Resources/bunny.png');
const textureBall = PIXI.Texture.from('Resources/ball.png');

const rowNum = 10;
const columnNum = 10;
const bunnyWidth = app.screen.width / columnNum;
const bunnyHeight = app.screen.height / rowNum;

var arrBlocks = new Array(rowNum);
var arrBlocks_Value = new Array(rowNum);
const ballNumPerSpawn = 3;
let timeToSpawn = 2;
let timeCount = 0;
var Color = [0xff0000, 0xbfff00, 0x0080ff];
var choosenBlock = null;

var isGameOver = false;

for (let row = 0; row < rowNum; row++) {
    arrBlocks[row] = new Array(columnNum);
    arrBlocks_Value[row] = new Array(columnNum);

    for (let column = 0; column < columnNum; column++) {
        const bunny = new PIXI.Sprite(textureBlock);
        bunny.anchor.set(0.5, 0.5);
        bunny.width = bunnyWidth;
        bunny.height = bunnyHeight;
        bunny.x = column * bunny.width + bunny.width / 2;
        bunny.y = row * bunny.height + bunny.height / 2;

        // make the button interactive...

        // Pointers normalize touch and mouse
        bunny.on('pointerdown', onBlockClick);

        container.addChild(bunny);
        bunny.buttonMode = true;
        bunny.interactive = true;

        arrBlocks[row][column] = bunny;
        arrBlocks_Value[row][column] = 0;
    }
}

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;


// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

app.view.style.position = 'absolute';
app.view.style.left = (50 - app.screen.width / window.screen.width * 100 / 2) + '%';

// Listen for animate update
app.ticker.add((delta) => {
    // if(isGameOver) {
    //     return;
    // }

    // var deltaTime = delta;
    // timeCount += deltaTime;

    // if(timeCount >= timeToSpawn) {
    //     Spawn();
    //     timeCount = 0;
    // }
});

function Spawn() {
    const maxBlockNum = rowNum * columnNum;

    var indexToSpawn = new Array(ballNumPerSpawn);

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
        var realIndex_Row = Math.floor(indexToSpawn[i] / columnNum);
        var realIndex_Columns = Math.floor(indexToSpawn[i] % columnNum);
        var failCount = 0;
        while (arrBlocks_Value[realIndex_Row][realIndex_Columns] != 0) {
            indexToSpawn[i]++;
            if (indexToSpawn[i] >= maxBlockNum) {
                failCount++;
                if (failCount > 2) {
                    isGameOver = true;
                    return false;
                }
                indexToSpawn[i] -= maxBlockNum;
            }
            realIndex_Row = Math.floor(indexToSpawn[i] / columnNum);
            realIndex_Columns = Math.floor(indexToSpawn[i] % columnNum);
        }

        var colorIndex = Math.floor(Math.random() * (Object.keys(Color).length)); // Random color
        var block = arrBlocks[realIndex_Row][realIndex_Columns];
        const ball = new PIXI.Sprite(textureBall);
        ball.anchor.set(0.5, 0.5);
        ball.width = block.width;
        ball.height = block.height;
        // ball.x = block.x;
        // ball.y = block.y;
        ball.tint = Color[colorIndex];
        block.addChild(ball);

        ball.on('pointerdown', onBallClick);
        ball.buttonMode = true;
        ball.interactive = true;

        arrBlocks_Value[realIndex_Row][realIndex_Columns] = colorIndex + 1;
    }

    return true;
}

function onBallClick() {
    if (choosenBlock != null) {
        if (choosenBlock != this) {
            choosenBlock.scale.x = choosenBlock.scale.x / 1.1;
            choosenBlock.scale.y = choosenBlock.scale.y / 1.1;

            choosenBlock = this;
            choosenBlock.scale.x = choosenBlock.scale.x * 1.1;
            choosenBlock.scale.y = choosenBlock.scale.y * 1.1;
        }
    }
    else {
        choosenBlock = this;
        choosenBlock.scale.x = choosenBlock.scale.x * 1.1;
        choosenBlock.scale.y = choosenBlock.scale.y * 1.1;
    }
}

function onBlockClick() {
    if(this.children[0]) {
        return;
    }
    const ballX = Math.floor(choosenBlock.parent.x / choosenBlock.parent.width);
    const ballY = Math.floor(choosenBlock.parent.y / choosenBlock.parent.height);
    const blockX = Math.floor(this.x / this.width);
    const blockY = Math.floor(this.y / this.height);

    if (choosenBlock != null) {
        if (choosenBlock.parent != this) {
            arrBlocks_Value[blockY][blockX] = arrBlocks_Value[ballY][ballX];
            arrBlocks_Value[ballY][ballX] = 0;
            choosenBlock.scale.x = choosenBlock.scale.x / 1.1;
            choosenBlock.scale.y = choosenBlock.scale.y / 1.1;
            this.addChild(choosenBlock);
            choosenBlock = null;
            Spawn();
            CheckBlockAt(this);
        }
    }
}

function CheckBlockAt(block) {
    const currentColumn = Math.floor(block.x / block.width);
    const currentRow = Math.floor(block.y / block.height);


    var colorToCheck = arrBlocks_Value[currentRow][currentColumn];

    // Check up
    var matchCount_Up = 0;
    var matchCount_Down = 0;
    var up = currentRow;
    var down = currentRow;
    while (up >= 0) {
        if (arrBlocks_Value[up][currentColumn] == colorToCheck) {
            matchCount_Up++;
        }
        else {
            break;
        }
        up--;
    }

    // Check up
    while (down < rowNum) {
        if (arrBlocks_Value[down][currentColumn] == colorToCheck) {
            matchCount_Down++;
        }
        else {
            break;
        }
        down++;
    }

    // Clean if >= 5 matches
    if (matchCount_Up + matchCount_Down - 1 >= 5) {
        for (var i = 1; i < matchCount_Up; i++) {
            arrBlocks_Value[currentRow - i][currentColumn] = 0;
            arrBlocks[currentRow - i][currentColumn].children[0].destroy();
        }

        for (var i = 1; i < matchCount_Down; i++) {
            arrBlocks_Value[currentRow + i][currentColumn] = 0;
            arrBlocks[currentRow + i][currentColumn].children[0].destroy();
        }
    }

    // Check left
    var matchCount_Left = 0;
    var matchCount_Right = 0;
    var left = currentColumn;
    var right = currentColumn;
    while (left >= 0) {
        if (arrBlocks_Value[currentRow][left] == colorToCheck) {
            matchCount_Left++;
        }
        else {
            break;
        }
        left--;
    }

    // Check right
    while (right < columnNum) {
        if (arrBlocks_Value[currentRow][right] == colorToCheck) {
            matchCount_Right++;
        }
        else {
            break;
        }
        right++;
    }

    // Clean if >= 5 matches
    if (matchCount_Left + matchCount_Right - 1 >= 5) {
        for (var i = 1; i < matchCount_Left; i++) {
            arrBlocks_Value[currentRow][currentColumn - i] = 0;
            arrBlocks[currentRow][currentColumn - i].children[0].destroy();
        }

        for (var i = 1; i < matchCount_Right; i++) {
            arrBlocks_Value[currentRow][currentColumn + i] = 0;
            arrBlocks[currentRow][currentColumn + i].children[0].destroy();
        }
    }

    if (matchCount_Left + matchCount_Right - 1 >= 5 || matchCount_Up + matchCount_Down - 1 >= 5) {
        arrBlocks_Value[currentRow][currentColumn] = 0;
        arrBlocks[currentRow][currentColumn].children[0].destroy();
    }
}

Spawn();