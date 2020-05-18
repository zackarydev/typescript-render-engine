import { IRenderingLayer } from '../RenderingLayer';

import { LayerIndex } from '../types';

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
	getLayer(layerIndex: LayerIndex): IRenderingLayer | null;

	/**
	 * Add a layer to the engine.
	 * @param layer Layer to add to the engine
	 */
	registerLayer(layer: IRenderingLayer): void;
}

export default class Engine implements IEngine {
	/**
	 * Holds all layers
	 */
	private layers: IRenderingLayer[];

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

	/**
	 * To prevent re-allocation of variables after each render/update loop,
	 * we create an layer counter variable to reuse.
	 */
	private layerCounter: number;

	/**
	 * To prevent re-allocation of variables after each render/update loop,
	 * we create a variable to keep track of the current delta time.
	 */
	private currentDeltaTime: number;

	constructor() {
		this.layers = [];
		this.layerCounter = 0;

		// animation control.
		this.shouldRender = true;
		this.lastFrameRenderedTime = null;
		this.renderingId = null;
		this.currentDeltaTime = 0;

		// rebinding.
		this.requestFrameA = this.requestFrameA.bind(this);
		this.requestFrameB = this.requestFrameB.bind(this);
	}

	getLayer(layerIndex: LayerIndex) {
		return this.layers.find((layer) => layer.layerIndex === layerIndex) || null;
	}

	registerLayer(layer: IRenderingLayer) {
		this.layers.push(layer);
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
		this.currentDeltaTime = timestamp - this.lastFrameRenderedTime;
		this.lastFrameRenderedTime = timestamp;

		for (this.layerCounter = 0; this.layerCounter < this.layers.length; this.layerCounter++) {
			this.layers[this.layerCounter].update(this.currentDeltaTime);
			this.layers[this.layerCounter].render();
		}
	}
}
