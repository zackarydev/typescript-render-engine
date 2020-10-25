import { IEntity, LayerIndex, RenderLayerFunction, UpdateLayerFunction, ResizeMethod } from '../types';

/**
 * An interface of all necessary functions and properties a rendering layer must have.
 */
export interface IRenderingLayer {
	/**
	 * The z-index of the rendering layer.
	 */
	readonly layerIndex: LayerIndex;

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
	getContext: () => CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

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

	attachOffscreenCanvas(offscreenCanvas: OffscreenCanvas, width: number, height: number): void;
}

export abstract class RenderingLayer implements IRenderingLayer {
	/**
	 * The z-index of the rendering layer
	 */
	readonly layerIndex: LayerIndex;

	/**
	 * The canvas' 2D rendering context.
	 */
	private context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

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
	readonly entities: IEntity[];

	/**
	 * To prevent re-allocation of variables after each render/update loop,
	 * we create an entity counter variable to reuse.
	 */
	private entityCounter: number;

	/**
	 * Construct a new layer that will hold a list of entityes or updaters.
	 * @param layerIndex Number representing the z-index of the layer on the screen.
	 * @param layerType Whether the layer elements will be updated on every frame
	 * @param entity An optional, default first entity.
	 */
	constructor(
		layerIndex: LayerIndex,
		initialWidth?: number,
		initialHeight?: number,
		initialX: number = 0,
		initialY: number = 0,
	) {
		this.layerIndex = layerIndex;

		this.entities = [];
		this.entityCounter = 0;

		this.x = initialX;
		this.y = initialY;

		if(self.document === undefined) {
			(self as unknown as Worker).postMessage({
				layerIndex,
				width: initialWidth,
				height: initialHeight,
				x: initialX,
				y: initialY,
			});
			this.context = null;
			this.width = 0;
			this.height = 0;
			return;
		}

		this.width = initialWidth === undefined ? document.body.clientWidth + 1 : initialWidth;
		this.height = initialHeight === undefined ? document.body.clientHeight + 1 : initialHeight;


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
		if (resizeMethod === ResizeMethod.FROM_CENTER) {
			xOffset = (this.width - newWidth) / 2;
			yOffset = (this.height - newHeight) / 2;
		}

		this.width = newWidth;
		this.height = newHeight;

		if(!this.context) {
			return;
		}

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

		if (!this._isLayerWithinBounds()) {
			throw new Error('Cannot position and resize a layer outside of document body.');
		}
		if(this.context instanceof OffscreenCanvasRenderingContext2D) {
			return;
		}

		if(!this.context) {
			return;
		}

		this.context.canvas.style.left = `${this.x}px`;
		this.context.canvas.style.top = `${this.y}px`;
	}

	/**
	 * Add an entity to this layer
	 * @param renderElement The entity that will be added to this layer
	 */
	addEntity(entity: IEntity) {
		if (!this._isEntityValid(entity)) {
			throw new Error('Invalid entity cannot be added to this layer.');
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
		if(!this.context) {
			return;
		}
		this.context.clearRect(-1, -1, this.width, this.height);
	}

	/**
	 * Update all entities in our rendering layer.
	 * If the rendering layer is not a dynamic layer, then no update is made.
	 *
	 * @param deltaTime Time since the last render in ms.
	 */
	update(deltaTime: number) {
		for (this.entityCounter = 0; this.entityCounter < this.entities.length; this.entityCounter++) {
			// We can force the entity's update function because it is checked in the `addEntity` function.
			this.entities[this.entityCounter].update?.(deltaTime);
		}
	}

	/**
	 * Render all entities of this rendering layer after clearing.
	 */
	render() {
		if(!this.context) {
			return;
		}
		this.clear();
		for (this.entityCounter = 0; this.entityCounter < this.entities.length; this.entityCounter++) {
			this.entities[this.entityCounter].render(this.context);
		}
	}

	attachOffscreenCanvas(offscreenCanvas: OffscreenCanvas, width: number, height: number) {
		const offscreenContext = offscreenCanvas.getContext('2d');
		if(!offscreenContext) {
			throw new Error('Offscreen context not received?');
		}
		this.context = offscreenContext;

		this.resize(width, height);
	}

	/**
	 * Returns true if the entity is valid for the given layer.
	 * @param entity
	 */
	abstract _isEntityValid(entity: IEntity): boolean;

	/**
	 * Returns true if the entity has a render function.
	 * @param entity
	 */
	protected _entityIsRenderable(entity: IEntity) {
		return Boolean(entity.render);
	}

	/**
	 * Returns true if the entity has an update function.
	 * @param entity
	 */
	protected _entityIsUpdatable(entity: IEntity) {
		return Boolean(entity.update);
	}

	/**
	 * Is the layer within the document bounds.
	 */
	private _isLayerWithinBounds() {
		if(self.document === undefined) {
			return true;
		}
		return (
			this.width + this.x > document.body.clientWidth ||
			this.height + this.y > document.body.clientHeight ||
			this.x < 0 ||
			this.y < 0
		);
	}
}
