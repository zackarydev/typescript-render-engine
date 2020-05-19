import { IRenderingLayer, RenderingLayer } from '..';
import { LayerIndex, IEntity } from '../../types';

export interface IDeferredLayer extends IRenderingLayer {
	readonly deferredTime: number;
}

export class DeferredLayer extends RenderingLayer implements IDeferredLayer {
	/**
	 * Time in MS between layer updates and renders
	 */
	readonly deferredTime: number;

	/**
	 * Time in MS since the last render
	 */
	private elapsedTimeSinceRender: number;

	constructor(
		deferredTime: number,
		layerIndex: LayerIndex,
		initialWidth?: number,
		initialHeight?: number,
		initialX: number = 0,
		initialY: number = 0,
	) {
		super(layerIndex, initialWidth, initialHeight, initialX, initialY);

		this.deferredTime = deferredTime;
		this.elapsedTimeSinceRender = 0;
	}

	_isEntityValid(entity: IEntity): boolean {
		return super._entityIsRenderable(entity) && this._entityIsUpdatable(entity);
	}

	update(deltaTime: number) {
		this.elapsedTimeSinceRender += deltaTime;
		if (this.elapsedTimeSinceRender > this.deferredTime) {
			super.update(deltaTime);
		}
	}

	render() {
		if (this.elapsedTimeSinceRender > this.deferredTime) {
			this.elapsedTimeSinceRender = 0;
			super.render();
		}
	}
}
