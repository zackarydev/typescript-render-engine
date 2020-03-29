import { LayerType, IEntity, LayerIndex, RenderLayerFunction, UpdateLayerFunction } from '../types';

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
	 * Width of the document.
	 */
	width: number;

	/**
	 * Height of the document
	 */
	height: number;

	/**
	 * List of entities that are part of this rendering layer.
	 */
	entities: IEntity[];

	/**
	 * Construct a new layer that will hold a list of entityes or updaters.
	 * @param layerIndex Number representing the z-index of the layer on the screen.
	 * @param layerType Whether the layer elements will be updated on every frame
	 * @param entity An optional, default first entity.
	 */
	constructor(layerIndex: LayerIndex, layerType: LayerType, entity?: IEntity) {
		this.layerIndex = layerIndex;
		this.layerType = layerType;

		this.entities = [];
		if (entity) {
			this.addEntity(entity);
		}

		this.width = document.body.clientWidth;
		this.height = document.body.clientHeight;

		const canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.position = 'absolute';
		canvas.style.zIndex = `${this.layerIndex}`;
		canvas.style.display = 'inline';
		document.body.appendChild(canvas);

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not initialize canvas 2D context.');
		}
		this.context = context;
		this.context.translate(0.5, 0.5); // disables anti-aliasing
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
	_entityIsRenderable(entity: IEntity) {
		return Boolean(entity.render);
	}

	/**
	 * Returns true if the entity has an update function.
	 * @param entity
	 */
	_entityIsUpdatable(entity: IEntity) {
		return Boolean(entity.update);
	}
}
