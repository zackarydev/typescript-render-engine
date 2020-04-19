import { IEntity, IRenderingLayer } from "../../../src";
import { Colors } from "../constants";

export default class Score implements IEntity {
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