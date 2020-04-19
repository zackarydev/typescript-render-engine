import Engine, { RenderingLayer, LayerType } from '../../src';

import { LayerIndex, pCx, pCy, ANIMAL_SPREAD_DISTANCE } from './constants';

import Animal from './entities/animal';
import Background from './entities/background';
import PacMan from './entities/pacman';
import Score from './entities/score';

import { Manager } from './entities/manager';

const engine = new Engine();
const animalManager = new Manager<Animal>();

// Create the background layer
const backgroundLayer = new RenderingLayer(LayerIndex.BACKGROUND, LayerType.STATIC);
const backgroundEntity = new Background(backgroundLayer.getWidth(), backgroundLayer.getHeight());
backgroundLayer.addEntity(backgroundEntity);

// Register the layer background.
engine.registerLayer(backgroundLayer);

backgroundLayer.render();


// Create the animals
const animalsLayer = new RenderingLayer(LayerIndex.ANIMALS, LayerType.DYNAMIC);
// add 6 animals.
for (let i = 0; i<6; i++) {
    animalManager.add(new Animal(pCx + ANIMAL_SPREAD_DISTANCE * i, pCy, animalsLayer, animalManager));
}

// Register the square layer.
engine.registerLayer(animalsLayer);

// Create the score layer
const scoreLayer = new RenderingLayer(LayerIndex.SCORE, LayerType.STATIC);
const scoreEntity = new Score(scoreLayer);
scoreLayer.addEntity(scoreEntity);

// Register the layer score.
engine.registerLayer(scoreLayer);

scoreLayer.render();


// Create the pacman
const pacManLayer = new RenderingLayer(LayerIndex.PACMAN, LayerType.DYNAMIC);
const pacMan = new PacMan(pacManLayer, animalManager, scoreEntity);
pacManLayer.addEntity(pacMan);

// Register the pacman layer.
engine.registerLayer(pacManLayer);

// Start rendering.
engine.start();

document.body.onkeydown = function(keyEvent){
    if (keyEvent.key === 'd') {
        pacMan.changeDirection("right");
    } else if(keyEvent.key === 'a') {
        pacMan.changeDirection("left");
    }
};