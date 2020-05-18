import { IEntity, IStaticLayer } from "../../../src";
import { Colors } from "../constants";

export default class Score implements IEntity {
    layer: IStaticLayer;

    width: number;
    height: number;
    score: number;

    constructor(layer: IStaticLayer) {
        this.layer = layer;
        this.width = layer.getWidth();
        this.height = layer.getHeight();

        this.score = 0;
    }

    updateScore(newScore) {
        this.score = newScore;
        this.layer.allowRenderOnNextFrame();
    }

    render(context: CanvasRenderingContext2D) {
        context.fillStyle = Colors.SCORE_BACKGROUND;
        context.fillRect(this.width - 250, 10, 200, 65);

        context.fillStyle = Colors.SCORE_TEXT;
        context.font = '30px Arial';
        context.fillText(`Score: ${this.score}`, this.width - 220, 50);
    }
}