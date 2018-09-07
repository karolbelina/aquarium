function resize() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;

	let xRadius = 2 / (canvas.width * aquariumScreenCoverage),
		yRadius = 2 / (canvas.height * aquariumScreenCoverage);

	camera.radius = Math.max(xRadius, yRadius);
}

window.addEventListener('resize', resize);

resize();