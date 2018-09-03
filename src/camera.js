const mouse = {
    pressed: false,
    x: undefined,
    y: undefined,
    xBefore: undefined,
    yBefore: undefined,
    xSpeed: 0,
    ySpeed: 0
};

const camera = {
    radius: undefined,
    azimuth: 0,
    inclination: Math.PI / 16
};

window.addEventListener('mousemove',
    function(event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

window.addEventListener('mousedown',
    function(event) {
        if(event.which === 1) {
            mouse.pressed = true;
            event.preventDefault();
        }
    }
);

window.addEventListener('mouseup',
    function() {
        mouse.pressed = false;
    }
);

function handleControls() {
    if(mouse.pressed) {
        mouse.xSpeed = (mouse.x - mouse.xBefore) * cameraRotateFactor * camera.radius;
        mouse.ySpeed = (mouse.y - mouse.yBefore) * cameraRotateFactor * camera.radius;
    }
    else {
        mouse.xSpeed *= cameraFriction;
        mouse.ySpeed *= cameraFriction;
    }

    mouse.xBefore = mouse.x;
    mouse.yBefore = mouse.y;

    camera.azimuth = (((camera.azimuth + mouse.xSpeed) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    camera.inclination = Math.max(0, Math.min(camera.inclination + mouse.ySpeed, Math.PI / 2));
}