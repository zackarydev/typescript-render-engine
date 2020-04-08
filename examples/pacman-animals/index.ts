import Engine, { RenderingLayer, LayerType, IEntity, IRenderingLayer } from '../../src';

import * as DogCatCoveryJpg from './dog-and-cat-cover.jpg';


const enum Colors {
    BACKGROUND = 'rgb(14, 17, 37)',
    SCORE_BACKGROUND = '#FF0',
    SCORE_TEXT = 'rgb(14, 17, 37)',
    WALLS = 'rgb(17,0,244)',
    PACMAN = '#FF0',
};

const enum LayerIndex {
    BACKGROUND,
    SCORE,
    ANIMALS,
    PACMAN,
};

const MIN_MOUTH_SIZE = 0.001;
const MAX_MOUTH_SIZE = 0.2;
const MOUTH_SPEED = MAX_MOUTH_SIZE / 650; // takes x ms to open or close his mouth.

const BODY_SPEED = 75 / 650;
const BODY_RADIUS = 100;

const pCx = 200;
const pCy = 225;

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

        context.fillStyle = Colors.WALLS;
        context.fillRect(0, 375, this.width, 75);
        context.fillRect(0, 0, this.width, 75);
    }
}

class Score implements IEntity {
    layer: IRenderingLayer;

    width: number;
    height: number;
    score: number;

    constructor(layer: IRenderingLayer) {
        this.layer = layer;
        this.width = layer.width;
        this.height = layer.height;

        this.score = 0;
    }

    updateScore(newScore) {
        this.score = newScore;
        this.layer.render();
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = Colors.SCORE_BACKGROUND;
        context.fillRect(this.width - 250, 10, 200, 65);

        context.fillStyle = Colors.SCORE_TEXT;
        context.font = '30px Arial';
        context.fillText(`Score: ${this.score}`, this.width - 220, 50);
    }
}

class Animal implements IEntity {

    layer: IRenderingLayer;
    img: HTMLImageElement;

    width: number;
    height: number;
    x: number;
    y: number;

    constructor(x: number, y: number, layer: IRenderingLayer) {
        this.layer = layer;

        this.width = 200;
        this.height = 100;
        this.x = x;
        this.y = y - this.height/2;

        const canvasImg = new Image();
        canvasImg.src = DogCatCoveryJpg.default;
        canvasImg.onload = this.handleLoad(canvasImg);
    }

    handleLoad = (canvasImg: HTMLImageElement) => () => {
        this.img = canvasImg;
        this.layer.addEntity(this);
    }

    getEatten() {
        this.layer.removeEntity(this);
    }

    update(deltaTime: number) {
    }
    
    render(context: CanvasRenderingContext2D) {
        if(this.img) {
            context.drawImage(
                this.img, 
                this.x, this.y,
                this.width, this.height
            );
        }
    }
}

class PacMan implements IEntity {
    layer: IRenderingLayer; // layer used for max width/height.
    scorer: Score; // layer used for score
    animals: Animal[];

    radius: number;

    x: number;
    y: number;

    dx: number;
    dy: number;

    img: HTMLImageElement;
    
    mouthSize: number;
    mouthDelta: number;
    mouthStart: number;
    mouthEnd: number;

    eyeCXdelta: number;
    eyeCYdelta: number;

    score: number;

    orientation: 'left' | 'right';

    constructor(layer: IRenderingLayer, animals: Animal[], scorer: Score) {
        this.layer = layer;
        this.scorer = scorer;
        this.animals = animals;

        this.radius = BODY_RADIUS;
        this.x = layer.width/2;
        this.y = pCy;
        this.orientation = 'left';

        this.dx = -BODY_SPEED;
        this.dy = 0; // not moving in y direction at all.

        this.score = 0;

        this.mouthSize = 0.2;
        this.mouthDelta = MOUTH_SPEED;
        this.mouthStart = Math.PI;
        this.mouthEnd = 2*Math.PI;

        this.eyeCXdelta = 50 * Math.cos(0.3*Math.PI);
        this.eyeCYdelta = 50 * Math.sin(0.3*Math.PI);

        const canvasImg = new Image();
        canvasImg.src = DogCatCoveryJpg.default;
        canvasImg.onload = this.handleLoad(canvasImg);
    }

    handleLoad = (canvasImg: HTMLImageElement) => () => {
        this.img = canvasImg;
    };

    isOutOfBounds = (x: number) => (x + this.radius) > this.layer.width || (x - this.radius) < 0;

    changeDirection(directionKey: 'left' | 'right') {
        if(directionKey === 'left') {
            this.orientation = 'left';
            this.dx = -Math.abs(this.dx);
        } else if(directionKey === 'right') {
            this.orientation = 'right';
            this.dx = Math.abs(this.dx);
        }
    };

    updateAnimalBounds() {
        for(let i = 0; i<this.animals.length; i++) {
            const animal = this.animals[i];
            let x = this.x;
            if((animal.x < x) && (animal.x + animal.width) > (this.x + this.radius)) {
                if(animal.y > (this.y - this.radius) && (animal.y + animal.height) < (this.y + this.radius)) {
                    animal.getEatten();
                    this.score += 1;
                    this.scorer.updateScore(this.score);
                }
            }
        }
    };

    updateBody(deltaTime: number) {
        this.mouthSize += this.mouthDelta * deltaTime
        
        if(this.mouthSize <= 0 && this.mouthDelta < 0) {
            // reverse direction
            this.mouthDelta *= -1;
        }
        if(this.mouthSize <= 0) {
            this.mouthSize = MIN_MOUTH_SIZE;
        }
        
        if(this.orientation === 'left') {
            this.mouthStart = Math.PI - this.mouthSize*Math.PI;
            this.mouthEnd = Math.PI + this.mouthSize*Math.PI
        } else {
            this.mouthStart = this.mouthSize*Math.PI; // 36 degs in rad
            this.mouthEnd = (2 - this.mouthSize)*Math.PI; // 324 degs in rad
        }

        let eyeAngle = (0.25 + this.mouthSize)*Math.PI;
        this.eyeCXdelta = 50 * Math.cos(eyeAngle);
        this.eyeCYdelta = 50 * Math.sin(eyeAngle);

        if(this.mouthSize > MAX_MOUTH_SIZE && this.mouthDelta > 0) {
            // reverse direction
            this.mouthDelta *= -1;
        }
    }

    updatePosition(deltaTime) {
        const x = this.x + this.dx * deltaTime;
        if(!this.isOutOfBounds(x)) {
            this.x = x;
        }
        this.updateAnimalBounds();
    }

    update(deltaTime: number) {
        this.updateBody(deltaTime);
        this.updatePosition(deltaTime);
    }

    render(context: CanvasRenderingContext2D) {
        const radius = 100;

        context.beginPath();
        // draw his body
        context.arc(
            this.x, this.y, radius, 
            this.mouthStart, this.mouthEnd,
            this.orientation === 'left'
        );
        // line for the mouth, to the center
        context.lineTo(this.x, this.y);
        context.closePath();
        context.fillStyle = Colors.PACMAN;
        context.fill();

        // outline 
        context.strokeStyle = '#000';
        context.stroke();

        // A circle for the eye
        context.beginPath();
        let eyeOrientation = this.orientation === 'right' ? 1 : -1;
        context.arc(this.x + this.eyeCXdelta * eyeOrientation, this.y - this.eyeCYdelta, 10, 0, 2 * Math.PI);
        context.fillStyle = '#000';
        context.fill();

        // Outline the eye
        context.strokeStyle = '#FFF';
        context.stroke();

    }
}

const engine = new Engine();

// Create the background layer
const backgroundLayer = new RenderingLayer(LayerIndex.BACKGROUND, LayerType.STATIC);
const backgroundEntity = new Background(backgroundLayer.width, backgroundLayer.height);
backgroundLayer.addEntity(backgroundEntity);

// Register the layer background.
engine.registerLayer(backgroundLayer);

backgroundLayer.render();


// Create the animals
const animalsLayer = new RenderingLayer(LayerIndex.ANIMALS, LayerType.DYNAMIC);
new Animal(pCx, pCy, animalsLayer);
new Animal(pCx + 300, pCy, animalsLayer);
new Animal(pCx + 600, pCy, animalsLayer);
new Animal(pCx + 900, pCy, animalsLayer);
new Animal(pCx + 1200, pCy, animalsLayer);

// Register the square layer.
engine.registerLayer(animalsLayer);

// Create the score layer
const scoreLayer = new RenderingLayer(LayerIndex.SCORE, LayerType.STATIC);
const scoreEntity = new Score(scoreLayer);
scoreLayer.addEntity(scoreEntity);

// Register the layer score.
engine.registerLayer(scoreLayer);

scoreLayer.render();


// Create the pacman
const pacManLayer = new RenderingLayer(LayerIndex.PACMAN, LayerType.DYNAMIC);
const pacMan = new PacMan(pacManLayer, animalsLayer.entities as Animal[], scoreEntity);
pacManLayer.addEntity(pacMan);

// Register the pacman layer.
engine.registerLayer(pacManLayer);

// Start rendering.
engine.start();

document.body.onkeydown = function(keyEvent){
    if (keyEvent.key === 'd') {
        pacMan.changeDirection("right");
    } else if(keyEvent.key === 'a') {
        pacMan.changeDirection("left");
    }
};