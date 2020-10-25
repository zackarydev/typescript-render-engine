const worker = new Worker('worker.ts');
worker.postMessage({
    type: 'INIT',
    data: {
        windowWidth: document.body.clientWidth,
        windowHeight: document.body.clientHeight,
    }
}, []);

worker.addEventListener('message', function({data}) {
    const layerIndex = data.layerIndex;
    const {
        canvas,
        width,
        height,
    } = createCanvas(layerIndex, data.width, data.height, data.x, data.y);
    worker.postMessage({
        type: 'CREATE_LAYER',
        data: {
            layerIndex,
            canvas,
            width,
            height,
        }
    }, [canvas]);
});

function createCanvas(idx, width, height, x, y) {
    const realCanvas = document.createElement('canvas');
    realCanvas.style.position = 'absolute';
    realCanvas.style.zIndex = `${idx}`;
    realCanvas.style.display = 'inline';
    realCanvas.style.left = x;
    realCanvas.style.top = y;
    if(width === undefined) {
        width = document.body.clientWidth + 1;
    }
    if(height === undefined) {
        height = document.body.clientHeight + 1;
    }
    realCanvas.style.width = width;
    realCanvas.style.height = height;
    document.body.appendChild(realCanvas);

    const canvas = realCanvas.transferControlToOffscreen();
    return {
        canvas: canvas,
        width,
        height,
    };
}