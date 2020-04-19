import { IRenderingLayer } from '../RenderingLayer';

import { LayerType, LayerIndex } from '../types';

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
	getLayer(layerIndex: LayerIndex, layerType: LayerType): IRenderingLayer | null;

	/**
	 * Add a layer to the engine.
	 * @param layer Layer to add to the engine
	 */
	registerLayer(layer: IRenderingLayer): void;

	/**
	 * Set the pause handler of the engine. 
	 * @param handler Function to be called when the document changes visiblity to hidden
	 */
	registerPauseHandler(handler: Function): void;

	/**
	 * Set the resume handler of the engine. 
	 * @param handler Function to be called when the document changes visiblity to visible
	 */
	registerResumeHandler(handler: Function): void;
}

export default class Engine implements IEngine {
	/**
	 * Holds all static layers
	 * Static layers are only re-rendered when told.
	 */
	private staticLayers: IRenderingLayer[];

	/**
	 * Holds all dynamic layers.
	 * Dynamic layers are re-rendered every frame.
	 */
	private dynamicLayers: IRenderingLayer[];

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
	 * The handler function called when the page visibility is changed to hidden.
	 */
	private pauseHandler: Function | null;
	
	/**
	 * The handler function called when the page visibility is changed to visible.
	 */
	private resumeHandler: Function | null;

	constructor() {
		this.staticLayers = [];
		this.dynamicLayers = [];

		// animation control.
		this.shouldRender = true;
		this.lastFrameRenderedTime = null;
		this.renderingId = null;
		this.pauseHandler = null;
		this.resumeHandler = null;

		// rebinding.
		this.requestFrameA = this.requestFrameA.bind(this);
		this.requestFrameB = this.requestFrameB.bind(this);
		this.__handleVisibilityChange__ = this.__handleVisibilityChange__.bind(this);
		this.__registerEvents__ = this.__registerEvents__.bind(this);

		// event handling
		this.__registerEvents__();
	}

	getLayer(layerIndex: LayerIndex, layerType: LayerType) {
		if (layerType === LayerType.DYNAMIC) {
			return this.dynamicLayers.find((layer) => layer.layerIndex === layerIndex) || null;
		} else {
			return this.staticLayers.find((layer) => layer.layerIndex === layerIndex) || null;
		}
	}

	registerLayer(layer: IRenderingLayer) {
		if (layer.layerType === LayerType.DYNAMIC) {
			this.dynamicLayers.push(layer);
		} else {
			this.staticLayers.push(layer);
		}
	}

	/**
	 * Register the pause handler to be called once the engine becomes hidden
	 * @param handler function called once pause is invoked.
	 */
	registerPauseHandler(handler: Function) {
		this.pauseHandler = handler;
	}

	/**
	 * Register the resume handler to be called once the engine becomes visible again
	 * @param handler function called once resume is invoked.
	 */
	registerResumeHandler(handler: Function) {
		this.resumeHandler = handler;
	}

	start() {
		this.shouldRender = true; // say we want to animate.
		this.lastFrameRenderedTime = null;
		this.renderingId = window.requestAnimationFrame(this.requestFrameA);
	}

	stop() {
		this.shouldRender = false;
		if (this.renderingId) {
			window.cancelAnimationFrame(this.renderingId);
		}
	}


	private requestFrameA(timestamp: DOMHighResTimeStamp) {
		this.render(timestamp);

		if (this.shouldRender) {
			this.renderingId = window.requestAnimationFrame(this.requestFrameB);
		}
	}

	private requestFrameB(timestamp: DOMHighResTimeStamp) {
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

	/**
	 * Handles page visibility change events.
	 */
	private __handleVisibilityChange__() {
		if (document.visibilityState === 'hidden') {
			if(!this.shouldRender) {
				// if we are not rendering, do not handle visiblity change.
				return;
			}
			if (this.pauseHandler) {
				// if we have a pause handler defined, call it.
				this.pauseHandler();
			}
			// if the document becomes hidden, stop the rendering.
			this.stop();
		} else if(document.visibilityState === 'visible') {
			if (!this.renderingId) {
				// if we never rendered, then do not handle this.
				return;
			}
			// if there is no pause handler defined, restart our rendering.
			// this ensures a implementers have the control over unpausing.
			// For the engine to automatically restart, this means the engine must have been started manually first.
			if(this.resumeHandler) {
				this.resumeHandler();
			} else {
				this.start();
			}
		}
	}

	/**
	 * Register the events used by the engine.
	 */
	private __registerEvents__() {
		document.addEventListener("visibilitychange", this.__handleVisibilityChange__);
	}
}
