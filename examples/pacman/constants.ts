
export const enum Colors {
    BACKGROUND = 'rgb(14, 17, 37)',
    SCORE_BACKGROUND = '#FF0',
    SCORE_TEXT = 'rgb(14, 17, 37)',
    WALLS = 'rgb(17,0,244)',
    PACMAN = '#FF0',
};

export const enum LayerIndex {
    BACKGROUND,
    SCORE,
    ANIMALS,
    PACMAN,
};

export const MIN_MOUTH_SIZE = 0.001; // angle in rads
export const MAX_MOUTH_SIZE = 0.2; // angle in rads
export const MOUTH_SPEED = MAX_MOUTH_SIZE / 650; // takes x ms to open or close his mouth.

export const BODY_SPEED = 75 / 650; // 75px movement every 650 ms.
export const BODY_RADIUS = 100; // body radius of packman.

export const pCx = 200;
export const pCy = 225;

export const ANIMAL_SPREAD_DISTANCE = 300;