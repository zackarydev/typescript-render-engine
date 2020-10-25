import Engine, { IEntity, IRenderingLayer, StaticLayer, DynamicLayer } from '../../src';

const enum Colors {
    BACKGROUND = '#567D46',
    SQUARE = '#985629',
};

const enum LayerIndex {
    BACKGROUND,
    SQUARE,
};

const SQUARE_SPEED = 100/1000; // 100 pixels per second
const SQUARE_WIDTH = 50;
const SQUARE_HEIGHT = 50;

class Background implements IEntity {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = Colors.BACKGROUND;
        context.fillRect(0, 0, this.width, this.height);
        console.log('Rendered background');
    }
}

class Square implements IEntity {
    layer: IRenderingLayer; // layer used for max width/height.

    width: number;
    height: number;

    x: number;
    y: number;

    dx: number;
    dy: number;

    constructor(layer: IRenderingLayer) {
        this.layer = layer;
        this.width = SQUARE_WIDTH;
        this.height = SQUARE_HEIGHT;

        this.x = 10;
        this.y = 10;

        this.dx = 1;
        this.dy = 1;
    }

    isXOutOfBounds = () => this.x < 0 || (this.x + SQUARE_WIDTH) > this.layer.getWidth();

    isYOutOfBounds = () => this.y < 0 || (this.y + SQUARE_HEIGHT) > this.layer.getHeight();

    update(deltaTime: number) {
        const dist = SQUARE_SPEED * deltaTime;
        this.x += this.dx * dist;
        this.y += this.dy * dist;
        if(this.isXOutOfBounds()) {
            this.dx *= -1; // flip the direction.
        }
        if(this.isYOutOfBounds()) {
            this.dy *= -1; // flip the direction.
        }
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = Colors.SQUARE;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

const engine = new Engine(true);
// Create the background layer
const backgroundLayer = new StaticLayer(LayerIndex.BACKGROUND);
const backgroundEntity = new Background(backgroundLayer.getWidth(), backgroundLayer.getHeight());
backgroundLayer.addEntity(backgroundEntity);

// Register the layer background.
engine.registerLayer(backgroundLayer);

// Since the background is static, it must be rendered manually.
backgroundLayer.allowRenderOnNextFrame();

// Create the square
const squareLayer = new DynamicLayer(LayerIndex.SQUARE);
const square = new Square(squareLayer);
squareLayer.addEntity(square);

// Register the square layer.
engine.registerLayer(squareLayer);

// Start rendering.
engine.start();

self.addEventListener('message', ({ data }) => {
    if(data.type === 'INIT') {
        backgroundEntity.width = data.data.windowWidth;
        backgroundEntity.height = data.data.windowHeight;

        backgroundLayer.allowRenderOnNextFrame();
    }
});