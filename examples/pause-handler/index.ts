import Engine, { RenderingLayer, LayerType, IEntity, IRenderingLayer } from '../../src';

const enum Colors {
    BACKGROUND = '#567D46',
    SQUARE = '#985629',
    PAUSE_TEXT = '#808080',
    PAUSE_STROKE = '#BBBBBB',
};

const enum LayerIndex {
    BACKGROUND,
    SQUARE,
    PAUSE,
};

const SQUARE_SPEED = 100/1000; // 100 pixels per second
const SQUARE_WIDTH = 50;
const SQUARE_HEIGHT = 50;

const PAUSE_SPRING_DIST = 25;
const PAUSE_SPRING_SPEED = PAUSE_SPRING_DIST/1000; // 50 px up and down every 1s.

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
    }
}

class Pause implements IEntity {
    x: number; // center of layer
    y: number; // center of layer.
    initialY: number;

    springPercent: number;
    dir: number;

    text: string;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.initialY = y;

        this.springPercent = 0;
        this.dir = 1;

        this.text = 'Paused. Click to resume.';
    }

    update(deltaTime: number) {
        const dist = PAUSE_SPRING_SPEED * deltaTime;
        this.springPercent += this.dir * dist / PAUSE_SPRING_DIST;
        if(this.springPercent <= 0 || this.springPercent >= 1) {
            this.dir *= -1;
        }
        this.y = this.initialY + this.springPercent * PAUSE_SPRING_DIST;
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = Colors.PAUSE_TEXT;
        context.strokeStyle = Colors.PAUSE_STROKE;
        context.font = '40px Arial';
        const textWidth = context.measureText(this.text).width;
        const x = this.x - textWidth/2;
        context.fillText(this.text, x, this.y);
        context.strokeText(this.text, x, this.y);
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

    paused: boolean;

    constructor(layer: IRenderingLayer) {
        this.layer = layer;
        this.width = SQUARE_WIDTH;
        this.height = SQUARE_HEIGHT;

        this.x = 10;
        this.y = 10;

        this.dx = 1;
        this.dy = 1;

        this.paused = false;
    }

    setPaused = (isPaused: boolean) => {
        this.paused = isPaused;
    };

    isXOutOfBounds = () => this.x < 0 || (this.x + SQUARE_WIDTH) > this.layer.getWidth();

    isYOutOfBounds = () => this.y < 0 || (this.y + SQUARE_HEIGHT) > this.layer.getHeight();

    update(deltaTime: number) {
        if(this.paused) {
            return;
        }

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

let paused = false;

const engine = new Engine();

const pauseLayer = new RenderingLayer(LayerIndex.PAUSE, LayerType.DYNAMIC);
const pauseEntity = new Pause(pauseLayer.getWidth()/2, pauseLayer.getHeight()/2);
// pauseLayer.addEntity(pauseEntity);
engine.registerLayer(pauseLayer);

// Create the background layer
const backgroundLayer = new RenderingLayer(LayerIndex.BACKGROUND, LayerType.STATIC);
const backgroundEntity = new Background(backgroundLayer.getWidth(), backgroundLayer.getHeight());
backgroundLayer.addEntity(backgroundEntity);

// Register the layer background.
engine.registerLayer(backgroundLayer);

// Since the background is static, it must be rendered manually.
backgroundLayer.render();

// Create the square
const squareLayer = new RenderingLayer(LayerIndex.SQUARE, LayerType.DYNAMIC);
const square = new Square(squareLayer);
squareLayer.addEntity(square);

// Register the square layer.
engine.registerLayer(squareLayer);

function onPause(){
    console.log('Pausing game.');

    paused = true;
    pauseLayer.addEntity(pauseEntity);
}

function onResume() {
    console.log('Engine is now visible.');

    // Start animating the pause.
    square.setPaused(paused)
    
    // restart the engine.
    engine.start();
}

engine.registerPauseHandler(onPause);
engine.registerResumeHandler(onResume);

// Start rendering.
engine.start();

document.addEventListener('click', function() {
    if(paused){
        pauseLayer.removeEntity(pauseEntity);
        // force render because pause layer is static.
        pauseLayer.render();

        paused = false;
        square.setPaused(paused);
    }
})