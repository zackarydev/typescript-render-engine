import { IEntity, IRenderingLayer } from "../../../src";

import Score from "./score";
import Animal from "./animal";

import IManager from './manager';

import { BODY_RADIUS, pCy, BODY_SPEED, MOUTH_SPEED, MIN_MOUTH_SIZE, MAX_MOUTH_SIZE, Colors } from "../constants";

/**
 * https://cwestblog.com/2017/02/02/canvas-animating-pacman-head-in-js/
 * With some modifications.
 */
export default class PacMan implements IEntity {
    layer: IRenderingLayer; // layer used for max width/height.
    scorer: Score; // layer used for score
    animalManager: IManager<Animal>;

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

    constructor(layer: IRenderingLayer, animalManager: IManager<Animal>, scorer: Score) {
        this.layer = layer;
        this.scorer = scorer;
        this.animalManager = animalManager;

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
    }

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
        const animals = this.animalManager.get();
        for(let i = 0; i<animals.length; i++) {
            const animal = animals[i];
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