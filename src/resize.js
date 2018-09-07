function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	let xRadius = 2 / (canvas.width * aquariumScreenCoverage),
		yRadius = 2 / (canvas.height * aquariumScreenCoverage);

	camera.radius = Math.max(xRadius, yRadius);
}

window.addEventListener('resize', resize);

resize();