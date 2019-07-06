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

var isGameOver = false;

for (let row = 0; row < rowNum; row++) {
    arrBlocks[row] = new Array(columnNum);
    arrBlocks_Value[row] = new Array(columnNum);

    for(let column = 0; column < columnNum; column++) {
        const bunny = new PIXI.Sprite(textureBlock);
        bunny.anchor.set(0.5, 0.5);
        bunny.width = bunnyWidth;
        bunny.height = bunnyHeight;
        bunny.x = column * bunny.width + bunny.width / 2;
        bunny.y = row * bunny.height + bunny.height / 2;

        // make the button interactive...

        // Pointers normalize touch and mouse
        bunny.on('pointerdown', onClick);

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

app.view.style.position ='absolute';
app.view.style.left = (50 - app.screen.width/window.screen.width*100 / 2) + '%';

// Listen for animate update
app.ticker.add((delta) => {
    if(isGameOver) {
        return;
    }

    var deltaTime = delta;
    timeCount += deltaTime;

    if(timeCount >= timeToSpawn) {
        Spawn();
        timeCount = 0;
    }
});

function Spawn() {
    const maxBlockNum = rowNum * columnNum;

    var indexToSpawn = new Array(ballNumPerSpawn);

    // Random index
    for(var i = 0; i < indexToSpawn.length; i++) {
        indexToSpawn[i] = Math.random() * (maxBlockNum - 1); // 0-99
        indexToSpawn[i] = Math.round(indexToSpawn[i]); // 0-99
        
        // Normalize the random
        for(var j = 0; j < indexToSpawn.length; j++) {
            if(i != j && indexToSpawn[i] == indexToSpawn[j]) {
                indexToSpawn[j]++;
            }
            
        }

        // Spawn
        var realIndex_Row = Math.floor(indexToSpawn[i] / columnNum) ;
        var realIndex_Columns = Math.floor(indexToSpawn[i] % columnNum);
        var failCount = 0;
        while(arrBlocks_Value[realIndex_Row][realIndex_Columns] != 0) {
            indexToSpawn[i]++;
            if(indexToSpawn[i] >= maxBlockNum) {
                failCount++;
                if(failCount > 2) {
                    isGameOver = true;
                    return false;
                }
                indexToSpawn[i] -= maxBlockNum;
            }
            realIndex_Row = Math.floor(indexToSpawn[i] / columnNum) ;
            realIndex_Columns = Math.floor(indexToSpawn[i] % columnNum);
            console.log(arrBlocks_Value[realIndex_Row][realIndex_Columns]);
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
        arrBlocks_Value[realIndex_Row][realIndex_Columns] = colorIndex + 1;
    }

    return true;
}

function onClick() {
    this.destroy();
}
