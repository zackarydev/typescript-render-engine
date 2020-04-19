# TypeScript Render Engine
> A super simple and lightweight TypeScript rendering engine for making 2D JavaScript games using HTML Canvases.

[![GitHub package.json version](https://img.shields.io/github/package-json/v/zacktherrien/typescript-render-engine?style=for-the-badge)](https://github.com/ZackTherrien/typescript-render-engine/releases)

[Usage](#usage) | [Installation](#installation) | [Examples](#examples) | [Documentation](#documentation)

## Usage

###### Initialization

```
import Engine, { LayerType, RenderingLayer, IEntity } from '@zacktherrien/typescript-render-engine';

const engine = new Engine();
```

###### Creating layers
```
// create a new layer.
const backgroundLayer = new RenderingLayer(0, LayerType.STATIC);

// add the layer to the engine
engine.registerLayer(backgroundLayer);
```

###### Adding entities
```
// create an entity that extends the IEntity interface.
const terrain: IEntity = new Terrain(); // your class

// add the new entity to the layer
backgroundLayer.addEntity(terrain);
```

###### Start rendering
```
// start rendering.
engine.start();
```

## Installation

This package uses **Github Packages** as the NPM repository. [See here for help.](https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-npm-for-use-with-github-packages#installing-a-package)

Add the following to the `.npmrc` file at the root of your project's folder:
```
@zacktherrien:registry=https://npm.pkg.github.com
```

Then to install:
```
npm install @zacktherrien/typescript-render-engine
```

## [Examples](https://zacktherrien.github.io/typescript-render-engine)

* [Bouncing Square](https://zacktherrien.github.io/typescript-render-engine/squares/index.html)
* [Pacman](https://zacktherrien.github.io/typescript-render-engine/pacman/index.html)

## Documentation

### Class: Engine

###### Methods
* `start()` Starts rendering the registered layers.
* `stop()` Stops rendering.
* `registerLayer(layer: IRenderingLayer)` Add a layer to the engine
    * `layer` The layer to be added
* `getLayer(layerIndex: LayerIndex, layerType: LayerType): IRenderingLayer` Get a previous registered layer.
    * `layerIndex` a number representing the Z-Index of the layer.
    * `layerType` whether the layer wanted is `STATIC` or `DYNAMIC`

### Class: RenderingLayer

###### Properties
* `readonly layerIndex: LayerIndex` number representing the zindex of the layer
* `readonly layerType: LayerType` whether a layer is `STATIC` or `DYNAMIC`

###### Methods
* `constructor(layerIndex: LayerIndex, layerType: LayerType, entity?: Entity)` Creates a rendering layer.
    * `layerIndex` Number representing the z-index of the layer on the screen.
    * `layerType` Whether the layer is `STATIC` or `DYNAMIC`
    * `entity` An optional, default first entity of the layer.
* `addEntity(entity: IEntity)` Add an entity to be rendered
    * `entity` The entity to be added
* `removeEntity(entity: IEntity)` Remove an entity from being rendered
    * `entity` The entity to be deleted
* `getContext(): CanvasRenderingContext2D` Get the rendering context of this layer
* `update(deltaTime: number)` Updates all entities sequentially in the order they were added.
    * `deltaTime` Time (in `ms`) since the last frame was rendered
* `render()` Renders all the entities in this layer sequentially in the order they were added.
* `getWidth(): number` Get the width of the layer
* `getHeight(): number` Get the height of the layer
* `getX(): number` Get the x position of the layer, from the left side of the dom.
* `getY(): number` Get the y position of the layer, from the top of the dom.
* `resize(width: number, height: number, resizeMethod: ResizeMethod = ResizeMethod.FROM_ORIGIN): number` Get the y position of the layer, from the top of the dom.
    * `width` The new width of the layer
    * `height` The new height of the layer
    * `resizeMethod` How the resize will be performed, from the origin or from the center of layer.
* `setPosition(x: number, height: number)` Change the position of the layer.
    * `x` the new x position of the layer.
    * `y` the new y position of the layer.

### Types

* `RenderLayerFunction` Function signature of a layer's render function.
* `UpdateLayerFunction` Function signature of a layer's update function.
* `RenderFunction` Function signature of an entity's render function.
* `UpdateFunction` Function signature of an entity's update function.
* `LayerIndex` Number representing the Z-Index of a layer.
* `LayerType` Enum representing the type of layer.
    * `STATIC` A static layer will **not** be updated or re-rendered every frame.
    * `DYNAMIC` A dynamic layer will be updated then rendered every frame.
* `ResizeMethod` Enum representing the resizing strategy of a layer
    * `FROM_ORIGIN` Resize the layer conserving the (0,0) point at the same position in the screen.
    * `FROM_CENTER` Resize the layer conserving the center point at the same position in the screen.

#### Recommended constants:
```
/**
 * Enum representing all layers' z-index.
 */
const enum LayerIndex {
    BACKGROUND = 0,
    HOUSES = 1,
    PLAYERS = 2,
    HUD = 10,
}
```
