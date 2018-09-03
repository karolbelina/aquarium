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
    c.lineWidth = lineWidth / camera.radius;

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
        let tailDirection = Vector.multiply(boid.direction, -1),
            v1 = Vector.multiply(tailDirection, boid.radius),
            tailVector = Vector.multiply(v1, fishtailSize),
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

    // draw equator
    for(let i = 0; i < equatorSubdivisions; i++) {
        c.beginPath();
        c.ellipse(
            canvas.width / 2,
            canvas.height / 2,
            1 / camera.radius,
            Math.abs(ellipsesVerticalScale / camera.radius),
            0,
            Math.PI * 2 * i / equatorSubdivisions - camera.azimuth,
            Math.PI * 2 * (i + 0.5) / equatorSubdivisions - camera.azimuth
        );
        c.stroke();
    }
}