const canvas = document.getElementById('main');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const c = canvas.getContext('2d');

const mouse = {
    pressed: false,
    x: canvas.width / 2,
    y: canvas.height / 2,
    xBefore: canvas.width / 2,
    yBefore: canvas.height / 2,
    xSpeed: 0,
    ySpeed: 0
};

const camera = {
    radius: 0.006,
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

window.addEventListener('resize',
    function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
);




const floorPosition = -0.6;
const ceilingPosition = 0.9;

const backgroundColor = "#000000",
    foregroundColor = "#FFFFFF";




let boids = [];

class Boid {
    constructor(radius, position, velocity) {
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;
        this.newPosition = undefined;
        this.newVelocity = undefined;
        this.direction = new Vector(1, 0, 0);
    }
}




function draw() {
    const ellipsePosition = function(y) {
        return (canvas.height / 2) - (Math.cos(camera.inclination) * y) / camera.radius;
    };

    const ellipseScale = function(y) {
        return Math.sqrt(1 - y * y) / camera.radius;
    };

    const project = function(position) {
        let angle = Math.atan2(position.x, position.y),
            distance = Math.sqrt(position.x * position.x + position.y * position.y),
            xProjected = (canvas.width / 2) - Math.cos(angle - camera.azimuth) * distance / camera.radius,
            yProjected = (canvas.height / 2) - ((( Math.sin(angle - camera.azimuth) * distance) * Math.sin(camera.inclination)) + (Math.cos(camera.inclination) * position.z)) / camera.radius;

        return {x: xProjected, y: yProjected};
    };

    c.fillStyle = backgroundColor;
    c.setLineDash([]);

    // draw background
    c.fillRect(0, 0, innerWidth, innerHeight);

    c.strokeStyle = foregroundColor;
    c.fillStyle = foregroundColor;

    // draw glass
    c.beginPath();
    c.arc(canvas.width / 2, canvas.height / 2, 1 / camera.radius, 0, Math.PI * 2, false);
    c.stroke();

    let ellipsesVerticalScale = Math.sin(camera.inclination),
        floorEllipsePosition = ellipsePosition(floorPosition),
        floorEllipseScale = ellipseScale(floorPosition),
        ceilingEllipsePosition = ellipsePosition(ceilingPosition),
        ceilingEllipseScale = ellipseScale(ceilingPosition);

    // draw floor
    c.beginPath();
    c.ellipse(
        canvas.width / 2,
        floorEllipsePosition,
        Math.abs(floorEllipseScale),
        Math.abs(floorEllipseScale * ellipsesVerticalScale),
        0, 0, Math.PI * 2
    );
    c.stroke();

    // draw fish
    for(let boid of boids) {
        // draw body
        let bodyProjection = project(boid.position);

        c.beginPath();
        c.arc(bodyProjection.x, bodyProjection.y, boid.radius / camera.radius, 0, Math.PI * 2, false);
        c.fillStyle = foregroundColor;
        c.fill();

        // draw tail
        const tailSize = 1.5;
        let tailDirection = Vector.multiply(boid.direction, -1),
            v1 = Vector.multiply(tailDirection, boid.radius),
            tailVector = Vector.multiply(v1, tailSize),
            perp = Vector.crossProduct(tailVector, new Vector(0, 0, 1)).normalize(),
            v2 = Vector.crossProduct(tailVector, perp),
            v3 = Vector.crossProduct(tailVector, Vector.multiply(perp, -1)),
            v1Position = Vector.add(boid.position, v1),
            tailPosition = Vector.add(v1Position, tailVector),
            v1Projection = project(v1Position),
            v2Projection = project(Vector.add(tailPosition, v2)),
            v3Projection = project(Vector.add(tailPosition, v3));

        c.beginPath();
        c.moveTo(v1Projection.x, v1Projection.y);
        c.lineTo(v2Projection.x, v2Projection.y);
        c.lineTo(v3Projection.x, v3Projection.y);
        c.fillStyle = foregroundColor;
        c.fill();
    }

    // draw ceiling
    c.beginPath();
    c.ellipse(
        canvas.width / 2,
        ceilingEllipsePosition,
        Math.abs(ceilingEllipseScale),
        Math.abs(ceilingEllipseScale * ellipsesVerticalScale),
        0, 0, Math.PI * 2
    );
    c.stroke();

    c.setLineDash([8, 8]);
    c.lineDashOffset = camera.azimuth / camera.radius;

    // draw equator
    c.beginPath();
    c.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        1 / camera.radius,
        Math.abs(ellipsesVerticalScale / camera.radius),
        0, 0, Math.PI * 2
    );
    c.stroke();
}



const cohesionWeight = 1/1000,
    separationWeight = 1/4,
    alignmentWeight = 1/16,
    centerWeight = 1/15000,
    cohesionRadius = 0.125,
    separationRadius = 1.5,
    alignmentRadius = 0.15,
    speedLimit = 0.015;

function update() {
    for(let boid of boids) {
        const cohesionVector = Vector.multiply(cohesion(boid), cohesionWeight);
        const separationVector = Vector.multiply(separation(boid), separationWeight);
        const alignmentVector = Vector.multiply(alignment(boid), alignmentWeight);
        const centerVector = Vector.multiply(center(boid), centerWeight);

        boid.newVelocity = boid.velocity.copy();

        boid.newVelocity = Vector.add(boid.newVelocity, cohesionVector);
        boid.newVelocity = Vector.add(boid.newVelocity, separationVector);
        boid.newVelocity = Vector.add(boid.newVelocity, alignmentVector);
        boid.newVelocity = Vector.add(boid.newVelocity, centerVector);
        limit(boid);

        boid.newPosition = Vector.add(boid.position, boid.newVelocity);

        bound(boid);
    }

    for(let boid of boids) {
        boid.position = boid.newPosition;
        boid.velocity = boid.newVelocity;
        if(boid.newVelocity.magnitude() > 0) {
            boid.direction = boid.newVelocity.normalize();
        }
    }
}

function cohesion(boid) {
    let average = new Vector(0, 0, 0);
    let N = 0;

    for(let b of boids) {
        if(b !== boid) {
            if(Vector.subtract(b.position, boid.position).magnitude() < cohesionRadius) {
                average = Vector.add(average, b.position);
                N++;
            }
        }
    }

    if(N > 0) {
        average = Vector.divide(average, N);
        return Vector.subtract(average, boid.position);
    }

    return average;
}

function separation(boid) {
    let c = new Vector(0, 0, 0);

    for(let b of boids) {
        if(b !== boid) {
            if(Vector.subtract(b.position, boid.position).magnitude() < (boid.radius + b.radius) * separationRadius &&
                boid.radius <= b.radius) {
                c = Vector.subtract(c, Vector.subtract(b.position, boid.position));
            }
        }
    }

    return c;
}

function alignment(boid) {
    let average = new Vector(0, 0, 0);
    let N = 0;

    for(let b of boids) {
        if(b !== boid) {
            if(Vector.subtract(b.position, boid.position).magnitude() < alignmentRadius) {
                average = Vector.add(average, b.velocity);
                N++;
            }
        }
    }

    if(N > 0) {
        average = Vector.divide(average, N);
        return Vector.subtract(average, boid.velocity);
    }

    return average;
}

function center(boid) {
    const center = new Vector(0, 0, 0);

    return Vector.subtract(center, boid.position);
}

function bound(boid) {
    let collisionDetected = undefined;

    do {
        collisionDetected = false;

        let t = (floorPosition + boid.radius - boid.position.z) / (boid.newPosition.z - boid.position.z);

        if(0 <= t && t <= 1) {
            let intersectPoint = Vector.add(boid.position, Vector.multiply(boid.newVelocity, t));

            if(intersectPoint.x * intersectPoint.x + intersectPoint.y * intersectPoint.y <= (1 - boid.radius) * (1 - boid.radius) - (floorPosition + boid.radius) * (floorPosition + boid.radius)) {
                let reflectionVector = new Vector(boid.newVelocity.x, boid.newVelocity.y, -boid.newVelocity.z);

                let newPositionVector = Vector.multiply(reflectionVector, 1 - t);
                boid.newPosition = Vector.add(intersectPoint, newPositionVector);
                boid.newVelocity = reflectionVector;
                collisionDetected = true;
            }
        }

        t = (ceilingPosition - boid.radius - boid.position.z) / (boid.newPosition.z - boid.position.z);

        if(0 <= t && t <= 1) {
            let intersectPoint = Vector.add(boid.position, Vector.multiply(boid.newVelocity, t));

            if(intersectPoint.x * intersectPoint.x + intersectPoint.y * intersectPoint.y <= (1 - boid.radius) * (1 - boid.radius) - (ceilingPosition - boid.radius) * (ceilingPosition - boid.radius)) {
                let reflectionVector = new Vector(boid.newVelocity.x, boid.newVelocity.y, -boid.newVelocity.z);

                let newPositionVector = Vector.multiply(reflectionVector, 1 - t);
                boid.newPosition = Vector.add(intersectPoint, newPositionVector);
                boid.newVelocity = reflectionVector;
                collisionDetected = true;
            }
        }

        let p0 = boid.position,
            p1 = boid.newPosition,
            a = (p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y) + (p1.z - p0.z) * (p1.z - p0.z),
            b = 2 * (p0.x * (p1.x - p0.x) + p0.y * (p1.y - p0.y) + p0.z * (p1.z - p0.z)),
            c = p0.x * p0.x + p0.y * p0.y + p0.z * p0.z - (1 - boid.radius) * (1 - boid.radius),
            disc = b * b - 4 * a * c;

        if(disc > 0) {
            let t = (-b + Math.sqrt(disc)) / (2 * a);
            // pomijamy drugie rozwiązanie, bo punkt nigdy nie będzie poza okręgiem

            if(0 <= t && t <= 1) {
                let intersectPoint = Vector.add(boid.position, Vector.multiply(boid.newVelocity, t));

                if(intersectPoint.z >= floorPosition) {
                    let reflectionVector = Vector.reflect(boid.newVelocity, intersectPoint);

                    let newPositionVector = Vector.multiply(reflectionVector, 1 - t);
                    boid.newPosition = Vector.add(intersectPoint, newPositionVector);
                    boid.newVelocity = reflectionVector;
                    collisionDetected = true;
                }
            }
        }
    } while(collisionDetected);
}

function limit(boid) {
    if(boid.newVelocity.magnitude() > speedLimit) {
        boid.newVelocity = Vector.multiply(Vector.divide(boid.newVelocity, boid.newVelocity.magnitude()), speedLimit);
    }
}




function handleControls() {
    const factor = 16 * Math.PI;
    const friction = 0.9;

    if(mouse.pressed) {
        mouse.xSpeed = (mouse.x - mouse.xBefore) / factor;
        mouse.ySpeed = (mouse.y - mouse.yBefore) / factor;
    }
    else {
        mouse.xSpeed *= friction;
        mouse.ySpeed *= friction;
    }

    mouse.xBefore = mouse.x;
    mouse.yBefore = mouse.y;

    camera.azimuth = (((camera.azimuth + mouse.xSpeed) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    camera.inclination = Math.max(0, Math.min(camera.inclination + mouse.ySpeed, Math.PI / 2));
}




function init() {
    const fishCount = 200;

    for(let i = 0; i < fishCount; i++) {
        let vx = (Math.random() * 2 - 1) * 0.02,
            vy = (Math.random() * 2 - 1) * 0.02,
            vz = (Math.random() * 2 - 1) * 0.02,
            radius = Math.random() * 0.005 + 0.01;

        let position = new Vector(0, 0, 0);
        let velocity = new Vector(vx, vy, vz);

        boids.push(new Boid(radius, position, velocity));
    }
}

function animate() {
    draw();
    update();
    handleControls();

    requestAnimationFrame(animate);
}

init();
animate();