/**
 * The function used to render
 */
export type RenderFunction = (context: CanvasRenderingContext2D) => void;

/**
 * Function used to update
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
 * Enum for the layer types.
 * STATIC will not re-render every frame.
 * DYNAMIC will update and re-render every frame.
 */
export enum LayerType {
	STATIC,
	DYNAMIC,
}
