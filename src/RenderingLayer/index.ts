import { LayerType, IEntity, LayerIndex, RenderLayerFunction, UpdateLayerFunction, ResizeMethod } from '../types';

/**
 * An interface of all necessary functions and properties a rendering layer must have.
 */
export interface IRenderingLayer {
	/**
	 * The z-index of the rendering layer.
	 */
	readonly layerIndex: LayerIndex;

	/**
	 * Whether the layer is dynamic or static
	 */
	readonly layerType: LayerType;

	/**
	 * Render all entities in this layer to the context.
	 */
	render: RenderLayerFunction;

	/**
	 * Update all entities in this layer
	 */
	update: UpdateLayerFunction;

	/**
	 * Get the rendering layer's canvas context.
	 */
	getContext: () => CanvasRenderingContext2D;

	/**
	 * Get the width of the layer
	 */
	getWidth: () => number;

	/**
	 * Get the height of the layer
	 */
	getHeight: () => number;

	/**
	 * Get the x position of the layer
	 */
	getX: () => number;

	/**
	 * Get the y position of the layer
	 */
	getY: () => number;

	/**
	 * Resize the layer 
	 */
	resize: (width: number, height: number, resizeMethod: ResizeMethod) => void;

	/**
	 * Add a new entity to this rendering layer
	 * @param entity New entity to be added
	 */
	addEntity(entity: IEntity): void;

	/**
	 * Remove an entity from this rendering layer
	 * @param entity Entity to be removed
	 */
	removeEntity(entity: IEntity): void;
}

export class RenderingLayer implements IRenderingLayer {
	/**
	 * The z-index of the rendering layer
	 */
	readonly layerIndex: LayerIndex;

	/**
	 * Whether the layer is dynamic or static.
	 */
	readonly layerType: LayerType;

	/**
	 * The canvas' 2D rendering context.
	 */
	readonly context: CanvasRenderingContext2D;

	/**
	 * Width of the layer in the document
	 */
	private width: number;

	/**
	 * Height of the layer in the document
	 */
	private height: number;

	/**
	 * X Position of the layer
	 */
	private x: number;

	/**
	 * X Position of the layer
	 */
	private y: number;

	/**
	 * List of entities that are part of this rendering layer.
	 */
	private entities: IEntity[];

	/**
	 * Construct a new layer that will hold a list of entityes or updaters.
	 * @param layerIndex Number representing the z-index of the layer on the screen.
	 * @param layerType Whether the layer elements will be updated on every frame
	 * @param entity An optional, default first entity.
	 */
	constructor(layerIndex: LayerIndex, layerType: LayerType, initialWidth?: number, initialHeight?: number, initialX: number = 0, initialY: number = 0) {
		this.layerIndex = layerIndex;
		this.layerType = layerType;

		this.entities = [];

		this.width = initialWidth === undefined ? (document.body.clientWidth + 1) : initialWidth;
		this.height = initialHeight === undefined ? (document.body.clientHeight + 1) : initialHeight;
		this.x = initialX;
		this.y = initialY;

		const canvas = document.createElement('canvas');
		canvas.style.position = 'absolute';
		canvas.style.zIndex = `${this.layerIndex}`;
		canvas.style.display = 'inline';
		document.body.appendChild(canvas);
		
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not initialize canvas 2D context.');
		}
		this.context = context;
		this.context.translate(-0.5, -0.5); // disables anti-aliasing
		this.resize(this.width, this.height);
		this.setPosition(this.x, this.y);
	}

	/**
	 * Change the size of the layer.
	 * @param newWidth The new width of the layer 
	 * @param newHeight The new height of the layer
	 * @param resizeMethod How should we resize the layer: from the center, or from the top-left?
	 */
	resize(newWidth: number, newHeight: number, resizeMethod: ResizeMethod = ResizeMethod.FROM_ORIGIN) {
		let xOffset = 0;
		let yOffset = 0;
		if(resizeMethod === ResizeMethod.FROM_CENTER) {
			xOffset = (this.width - newWidth) / 2;
			yOffset = (this.height - newHeight) / 2;
		}

		this.width = newWidth;
		this.height = newHeight;

		this.context.canvas.width = this.width;
		this.context.canvas.height = this.height;

		this.setPosition(this.x + xOffset, this.y + yOffset);
	}

	/**
	 * Change the position of this layer
	 * @param newX the x position where 0 is the left of the document body.
	 * @param newY the y position where 0 is the top of the document
	 */
	setPosition(newX: number, newY: number) {
		this.x = newX;
		this.y = newY;

		if(!this._isLayerWithinBounds()) {
			throw new Error('Cannot position and resize a layer outside of document body.');
		}

		this.context.canvas.style.left = `${this.x}px`;
		this.context.canvas.style.top = `${this.y}px`;
	}

	/**
	 * Add an entity to this layer
	 * @param renderElement The entity that will be added to this layer
	 */
	addEntity(entity: IEntity) {
		if (!this._entityIsRenderable(entity)) {
			throw new Error('All entities must have a render function.');
		}
		if (this.layerType === LayerType.DYNAMIC && !this._entityIsUpdatable(entity)) {
			throw new Error('All entities of dynamic layers must have an updater function.');
		}
		this.entities.push(entity);
	}

	/**
	 * Remove an entity from this layer. Effectively, unrendering it.
	 * @param removeEntity Entity that will be deleted from this layer
	 */
	removeEntity(removeEntity: IEntity) {
		const renderersIdx = this.entities.indexOf(removeEntity);
		if (renderersIdx !== -1) {
			this.entities.splice(renderersIdx, 1);
		}
	}

	/**
	 * Get the width of the layer
	 */
	getWidth() {
		return this.width;
	}

	/**
	 * Get the height of the layer
	 */
	getHeight() {
		return this.height;
	}

	/**
	 * Get the x position of the layer
	 */
	getX() {
		return this.x;
	}

	/**
	 * Get the y position of the layer
	 */
	getY() {
		return this.y;
	}

	/**
	 * Get the canvas context for this layer
	 */
	getContext() {
		return this.context;
	}

	/**
	 * Clear the canvas' context.
	 */
	clear() {
		this.context.clearRect(-1, -1, this.width, this.height);
	}

	/**
	 * Update all entities in our rendering layer.
	 * If the rendering layer is not a dynamic layer, then no update is made.
	 *
	 * @param deltaTime Time since the last render in ms.
	 */
	update(deltaTime: number) {
		if (this.layerType !== LayerType.DYNAMIC) {
			return;
		}
		for (let i = 0; i < this.entities.length; i++) {
			// We can force the entity's update function because it is checked in the `addEntity` function.
			this.entities[i].update!(deltaTime);
		}
	}

	/**
	 * Render all entities of this rendering layer after clearing.
	 */
	render() {
		this.clear();
		for (let i = 0; i < this.entities.length; i++) {
			this.entities[i].render(this.context);
		}
	}

	/**
	 * Returns true if the entity has a render function.
	 * @param entity
	 */
	private _entityIsRenderable(entity: IEntity) {
		return Boolean(entity.render);
	}

	/**
	 * Returns true if the entity has an update function.
	 * @param entity
	 */
	private _entityIsUpdatable(entity: IEntity) {
		return Boolean(entity.update);
	}

	/**
	 * Is the layer within the document bounds.
	 */
	private _isLayerWithinBounds() {
		return (
			((this.width + this.x) > document.body.clientWidth) ||
			((this.height + this.y) > document.body.clientHeight) ||
			(this.x < 0) ||
			(this.y < 0)
		);
	}
}
