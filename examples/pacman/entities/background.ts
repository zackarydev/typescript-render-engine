import { IEntity } from '../../../src';
import { Colors } from '../constants';

export default class Background implements IEntity {
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