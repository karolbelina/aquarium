const camera = {
    radius: undefined,
    azimuth: 0,
    inclination: Math.PI / 16, 
    speed: {
        x: 0,
        y: 0
    }
};

let mouse = null;
let touches = [];




window.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);
window.addEventListener('mousemove', mouseMove, false);

window.addEventListener("touchstart", touchStart, false);
window.addEventListener("touchend", touchEnd, false);
window.addEventListener("touchcancel", touchEnd, false);
window.addEventListener("touchmove", touchMove, false);

function mouseDown(event) {
    if(event.which === 1) {
        mouse = {
            position: {
                x: event.x,
                y: event.y
            },
            lastPosition: {
                x: event.x,
                y: event.y
            }
        }
        event.preventDefault();
    }
}

function mouseUp() {
    mouse = null;
}

function mouseMove(event) {
    if(mouse) {
        mouse.position = {
            x: event.x,
            y: event.y
        }
    }
}

function touchStart(event) {
    for (let touch of event.changedTouches) {
        touches.push(
            {
                identifier: touch.identifier,
                position: {
                    x: touch.pageX,
                    y: touch.pageY
                },
                lastPosition: {
                    x: touch.pageX,
                    y: touch.pageY
                }
            }
        );
    }
}

function touchMove(event) {
    for(let touch of event.changedTouches) {
        let index = findTouchIndexById(touch.identifier);

        if(index > -1) {
            touches[index].position = {
                x: touch.pageX,
                y: touch.pageY
            };
        }
    }
}

function touchEnd(event) {
    for (let touch of event.changedTouches) {
        let index = findTouchIndexById(touch.identifier);

        if(index > -1) {
            touches.splice(index, 1); // remove it; we're done
        }
    }
}

function findTouchIndexById(idToFind) {
    for(let i = 0; i < touches.length; i++) {
        let id = touches[i].identifier;
    
        if(id === idToFind) {
            return i;
        }
    }

    return -1;
}




function handleControls() {
    if(mouse || touches.length > 0) {
        camera.speed.x = 0;
        camera.speed.y = 0;
    }
    else {
        camera.speed.x *= cameraFriction;
        camera.speed.y *= cameraFriction;
    }

    // handle mouse
    if(mouse) {
        camera.speed.x += (mouse.position.x - mouse.lastPosition.x) * cameraRotateFactor * camera.radius;
        camera.speed.y += (mouse.position.y - mouse.lastPosition.y) * cameraRotateFactor * camera.radius;

        mouse.lastPosition.x = mouse.position.x;
        mouse.lastPosition.y = mouse.position.y;
    }

    // handle touches
    for(let touch of touches) {
        camera.speed.x += (touch.position.x - touch.lastPosition.x) * cameraRotateFactor * camera.radius;
        camera.speed.y += (touch.position.y - touch.lastPosition.y) * cameraRotateFactor * camera.radius;

        touch.lastPosition.x = touch.position.x;
        touch.lastPosition.y = touch.position.y;
    }

    camera.azimuth = (((camera.azimuth + camera.speed.x) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    camera.inclination = Math.max(0, Math.min(camera.inclination + camera.speed.y, Math.PI / 2));
}