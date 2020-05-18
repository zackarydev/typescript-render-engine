import { IRenderingLayer, RenderingLayer } from '..';
import { LayerIndex, IEntity } from '../../types';

export interface IStaticLayer extends IRenderingLayer {
	allowRenderOnNextFrame(): void;
}

export class StaticLayer extends RenderingLayer implements IStaticLayer {
	private rerenderNextFrame: boolean;

	constructor(
		layerIndex: LayerIndex,
		initialWidth?: number,
		initialHeight?: number,
		initialX: number = 0,
		initialY: number = 0,
	) {
		super(layerIndex, initialWidth, initialHeight, initialX, initialY);

		this.rerenderNextFrame = false;
	}

	allowRenderOnNextFrame(): void {
		this.rerenderNextFrame = true;
	}

	_isEntityValid(entity: IEntity): boolean {
		return super._entityIsRenderable(entity);
	}

	render() {
		if (this.rerenderNextFrame) {
			this.rerenderNextFrame = false;
			super.render();
		}
	}
}
