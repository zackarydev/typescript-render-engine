import { IEntity, IRenderingLayer } from '../../../src';

import * as DogCatCoveryJpg from '../dog-and-cat-cover.jpg';

import IManager from './manager';

export default class Animal implements IEntity {

    layer: IRenderingLayer;
    animalManager: IManager<Animal>;
    
    img: HTMLImageElement;
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(x: number, y: number, layer: IRenderingLayer, animalManager: IManager<Animal>) {
        this.layer = layer;

        this.width = 200;
        this.height = 100;
        this.x = x;
        this.y = y - this.height/2;

        const canvasImg = new Image();
        canvasImg.src = DogCatCoveryJpg.default;
        canvasImg.onload = this.handleLoad(canvasImg);

        this.animalManager = animalManager;
    }

    handleLoad = (canvasImg: HTMLImageElement) => () => {
        this.img = canvasImg;
        this.animalManager.add(this);
        this.layer.addEntity(this);
    }

    getEatten() {
        this.animalManager.remove(this);
        this.layer.removeEntity(this);
    }

    update(deltaTime: number) {
        // Animals do not move.
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