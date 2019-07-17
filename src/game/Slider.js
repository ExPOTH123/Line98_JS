class Slider extends PIXI.Container {
    constructor() {
        super();

        this.bg = new PIXI.Sprite(PIXI.Texture.from('data/image/ui/slider_Bg.png'));
        this.bg.anchor.set(0.5);
        this.slideBar = new PIXI.Sprite(PIXI.Texture.from('data/image/ui/slideBar.png'));
        this.slideBar.anchor.set(0.5);
        this.slideBar_Width = this.slideBar.width;

        this.addChildAt(this.bg, 0);
        this.addChild(this.slideBar);
    }
    
    setPercent(percent) {
        this.slideBar.width = percent * this.slideBar_Width;
    }

    setSize(width, height) {
        this.bg.width = width;
        this.bg.height = height;
        this.slideBar.width = width;
        this.slideBar.height = height;
        this.slideBar_Width = this.slideBar.width;
    }
}

export default Slider;