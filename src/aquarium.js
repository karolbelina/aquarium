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




function update() {
    for(let boid of boids) {
        boid.newVelocity = boid.velocity.copy();

        cohesion(boid);
        separation(boid);
        alignment(boid);
        center(boid);
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
    let average = new Vector(0, 0, 0),
        N = 0;

    for(let b of boids) {
        if(b !== boid) {
            if(Vector.subtract(b.position, boid.position).magnitude() < cohesionRadius) {
                average = Vector.add(average, b.position);
                N++;
            }
        }
    }

    if(N > 0) {
        average = Vector.subtract(Vector.divide(average, N), boid.position);
    }

    boid.newVelocity = Vector.add(boid.newVelocity, Vector.multiply(average, cohesionWeight));
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

    boid.newVelocity = Vector.add(boid.newVelocity, Vector.multiply(c, separationWeight));
}

function alignment(boid) {
    let average = new Vector(0, 0, 0),
        N = 0;

    for(let b of boids) {
        if(b !== boid) {
            if(Vector.subtract(b.position, boid.position).magnitude() < alignmentRadius) {
                average = Vector.add(average, b.velocity);
                N++;
            }
        }
    }

    if(N > 0) {
        average = Vector.subtract(Vector.divide(average, N), boid.velocity);
    }

    boid.newVelocity = Vector.add(boid.newVelocity, Vector.multiply(average, alignmentWeight));
}

function center(boid) {
    const center = new Vector(0, 0, 0);

    boid.newVelocity = Vector.add(boid.newVelocity, Vector.multiply(Vector.subtract(center, boid.position), centerWeight));
}

function limit(boid) {
    if(boid.newVelocity.magnitude() > speedLimit) {
        boid.newVelocity = Vector.multiply(Vector.divide(boid.newVelocity, boid.newVelocity.magnitude()), speedLimit);
    }
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




function init() {
    for(let i = 0; i < fishCount; i++) {
        let vx = (Math.random() * 2 - 1) * 0.02,
            vy = (Math.random() * 2 - 1) * 0.02,
            vz = (Math.random() * 2 - 1) * 0.02,
            radius = minFishSize + Math.random() * (maxFishSize - minFishSize);

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