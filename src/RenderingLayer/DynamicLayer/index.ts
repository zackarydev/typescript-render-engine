import { IRenderingLayer, RenderingLayer } from '..';
import { LayerIndex, IEntity } from '../../types';

export interface IDynamicLayer extends IRenderingLayer {}

export class DynamicLayer extends RenderingLayer implements IDynamicLayer {
	constructor(
		layerIndex: LayerIndex,
		initialWidth?: number,
		initialHeight?: number,
		initialX: number = 0,
		initialY: number = 0,
	) {
		super(layerIndex, initialWidth, initialHeight, initialX, initialY);
	}

	_isEntityValid(entity: IEntity): boolean {
		return super._entityIsRenderable(entity) && this._entityIsUpdatable(entity);
	}
}
