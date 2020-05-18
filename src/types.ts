/**
 * The function used to render a layer from the engine
 */
export type RenderLayerFunction = () => void;

/**
 * Function used to update a layer
 */
export type UpdateLayerFunction = (deltaTime: number) => void;

/**
 * The function used to render entities within a layer
 */
export type RenderFunction = (context: CanvasRenderingContext2D) => void;

/**
 * Function used to update entities within a layer
 */
export type UpdateFunction = (deltaTime: number) => void;

/**
 * Inteface for a generic entity with a render and optional update statement.
 */
export interface IEntity {
	render: RenderFunction;
	update?: UpdateFunction;
}

/**
 * Type of a layer index
 */
export type LayerIndex = number;

/**
 * Resize strategy types for the layer resize method.
 * FROM_ORIGIN: will resize the layer but will also make sure the center stays at the same position
 * FROM_CENTER: will resize the layer but will also make sure the top-left stays at the same position
 */
export enum ResizeMethod {
	FROM_ORIGIN, // from the top left
	FROM_CENTER, // from the center
}
