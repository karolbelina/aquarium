function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	let xRadius = 2 / (window.innerWidth * aquariumScreenCoverage),
		yRadius = 2 / (window.innerHeight * aquariumScreenCoverage);

	camera.radius = Math.max(xRadius, yRadius);
}

window.addEventListener('resize', resize);

resize();