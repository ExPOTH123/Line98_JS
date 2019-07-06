const app = new PIXI.Application({
    width: 400, height: 400, backgroundColor: 0x1099bb, resolution: window.devicePixelRatio || 1,
});
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from('Resources/bunny.png');

const rowNum = 10;
const columnNum = 10;
const bunnyWidth = app.screen.width / columnNum;
const bunnyHeight = app.screen.height / rowNum;

for (let row = 0; row < rowNum; row++) {
    for(let column = 0; column < columnNum; column++) {
        const bunny = new PIXI.Sprite(texture);
        bunny.anchor.set(0.5, 0.5);
        bunny.width = bunnyWidth;
        bunny.height = bunnyHeight;
        console.log(bunny.width);
        bunny.x = column * bunny.width + bunny.width / 2;
        bunny.y = row * bunny.height + bunny.height / 2;

        // make the button interactive...

        // Pointers normalize touch and mouse
        bunny.on('pointerdown', onClick);

        container.addChild(bunny);
        bunny.buttonMode = true;
        bunny.interactive = true;
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

// // Listen for animate update
// app.ticker.add((delta) => {
//     // rotate the container!
//     // use delta to create frame-independent transform
//     container.rotation -= 0.01 * delta;
// });

function onClick() {
    this.destroy();
}
