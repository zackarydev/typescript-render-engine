import RenderingLayer from './RenderingLayer';

import { LayerType, LayerIndex } from './types';

export interface IEngine {
	/**
	 * Start rendering
	 */
	start(): void;

	/**
	 * Stop rendering
	 */
	stop(): void;

	/**
	 * Get a layer based on it's index and layer type.
	 * @param layerIndex The z-index of a layer
	 * @param layerType The layer type of the layer wanted
	 */
	getLayer(layerIndex: LayerIndex, layerType: LayerType): RenderingLayer | null;

	/**
	 * Add a layer to the engine.
	 * @param layer Layer to add to the engine
	 */
	registerLayer(layer: RenderingLayer): void;
}

export default class Engine implements IEngine {
	/**
	 * Holds all static layers
	 * Static layers are only re-rendered when told.
	 */
	private staticLayers: RenderingLayer[];

	/**
	 * Holds all dynamic layers.
	 * Dynamic layers are re-rendered every frame.
	 */
	private dynamicLayers: RenderingLayer[];

	/**
	 * Variable to know if we should keep rendering.
	 */
	private shouldRender: boolean;

	/**
	 * The handler ID of the rendering loop
	 */
	private renderingId: number | null;

	/**
	 * Keeps track of when the last frame was rendered to extract deltas.
	 */
	private lastFrameRenderedTime: DOMHighResTimeStamp | null;

	constructor() {
		this.staticLayers = [];
		this.dynamicLayers = [];

		// animation control.
		this.shouldRender = true;
		this.lastFrameRenderedTime = null;
		this.renderingId = null;

		// rebinding.
		this.requestFrameA = this.requestFrameA.bind(this);
		this.requestFrameB = this.requestFrameB.bind(this);
	}

	getLayer(layerIndex: LayerIndex, layerType: LayerType) {
		if (layerType === LayerType.DYNAMIC) {
			return this.dynamicLayers.find((layer) => layer.layerIndex === layerIndex) || null;
		} else {
			return this.staticLayers.find((layer) => layer.layerIndex === layerIndex) || null;
		}
	}

	registerLayer(layer: RenderingLayer) {
		if (layer.layerType === LayerType.DYNAMIC) {
			this.dynamicLayers.push(layer);
		} else {
			this.staticLayers.push(layer);
		}
	}

	start() {
		this.shouldRender = true; // say we want to animate.
		this.renderingId = window.requestAnimationFrame(this.requestFrameA);
	}

	stop() {
		this.shouldRender = false;
		if (this.renderingId) {
			window.cancelAnimationFrame(this.renderingId);
		}
	}

	requestFrameA(timestamp: DOMHighResTimeStamp) {
		this.render(timestamp);

		if (this.shouldRender) {
			this.renderingId = window.requestAnimationFrame(this.requestFrameB);
		}
	}

	requestFrameB(timestamp: DOMHighResTimeStamp) {
		this.render(timestamp);

		if (this.shouldRender) {
			this.renderingId = window.requestAnimationFrame(this.requestFrameA);
		}
	}

	render(timestamp: DOMHighResTimeStamp = 0) {
		if (!this.lastFrameRenderedTime) {
			this.lastFrameRenderedTime = timestamp;
		}
		const deltaTime = timestamp - this.lastFrameRenderedTime;
		this.lastFrameRenderedTime = timestamp;

		for (let i = 0; i < this.dynamicLayers.length; i++) {
			this.dynamicLayers[i].update(deltaTime);
			this.dynamicLayers[i].render();
		}
	}
}
