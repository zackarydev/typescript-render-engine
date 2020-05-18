import Engine, { StaticLayer, DynamicLayer } from '../../src';

import { LayerIndex, pCx, pCy, ANIMAL_SPREAD_DISTANCE } from './constants';

import Animal from './entities/animal';
import Background from './entities/background';
import PacMan from './entities/pacman';
import Score from './entities/score';

import { Manager } from './entities/manager';

const engine = new Engine();
const animalManager = new Manager<Animal>();

// Create the background layer
const backgroundLayer = new StaticLayer(LayerIndex.BACKGROUND);
const backgroundEntity = new Background(backgroundLayer.getWidth(), backgroundLayer.getHeight());
backgroundLayer.addEntity(backgroundEntity);

// Register the layer background.
engine.registerLayer(backgroundLayer);

backgroundLayer.allowRenderOnNextFrame();

// Create the animals
const animalsLayer = new DynamicLayer(LayerIndex.ANIMALS);
// add 6 animals.
for (let i = 0; i<6; i++) {
    animalManager.add(new Animal(pCx + ANIMAL_SPREAD_DISTANCE * i, pCy, animalsLayer, animalManager));
}

// Register the square layer.
engine.registerLayer(animalsLayer);

// Create the score layer
const scoreLayer = new StaticLayer(LayerIndex.SCORE);
const scoreEntity = new Score(scoreLayer);
scoreLayer.addEntity(scoreEntity);

// Register the layer score.
engine.registerLayer(scoreLayer);

scoreLayer.allowRenderOnNextFrame();


// Create the pacman
const pacManLayer = new DynamicLayer(LayerIndex.PACMAN);
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