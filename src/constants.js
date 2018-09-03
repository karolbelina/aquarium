const canvas = document.getElementById('main');

const cameraRotateFactor = 2,
	  cameraFriction = 0.9;

const aquariumScreenCoverage = 0.8;

const c = canvas.getContext('2d');

const backgroundColor = "#212842",
      foregroundColor = "#ffd696",
      lineWidth = 0.01;

const fishtailSize = 1.5;

const equatorSubdivisions = 50;

const floorPosition = -0.6,
      ceilingPosition = 0.9;

const cohesionWeight = 1/1000,
	  separationWeight = 1/4,
	  alignmentWeight = 1/16,
	  centerWeight = 1/15000,
	  cohesionRadius = 0.125,
	  separationRadius = 1.5,
	  alignmentRadius = 0.15,
	  speedLimit = 0.015;

const fishCount = 200;