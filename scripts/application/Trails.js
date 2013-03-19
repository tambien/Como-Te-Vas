$(function() {
	TRAILS.initialize();
})
/*
 * the main application
 */
var TRAILS = function() {

	//GLOBALS//////////////////////////////////////////////////////////////////

	var versionNumber = "0.0.1";

	var context = new webkitAudioContext();

	var $container;

	var track;

	//INITIALIZATION///////////////////////////////////////////////////////////

	function initialize() {
		console.log("COMO TE VAS version " + versionNumber);
		$container = $("#canvas");
		//setup the rendering context
		setupTHREE();
		setupStats();
		//bind the basic events
		bindEvents();
		//start the drawing
		render();
		makeTracks();
	}

	//THREE////////////////////////////////////////////////////////////////////

	var camera, projector, renderer;

	function setupTHREE() {
		camera = new THREE.PerspectiveCamera(70, 4 / 3, 1, 10000);
		camera.position.set(0, 0, 360);
		TRAILS.scene = new THREE.Scene();
		projector = new THREE.Projector();
		//the renderer
		renderer = new THREE.CanvasRenderer();
		$container.append(renderer.domElement);
		//initialize the size
		sizeTHREE();
	}

	function sizeTHREE() {
		TRAILS.width = $container.width();
		TRAILS.height = $container.height();
		camera.aspect = TRAILS.width / TRAILS.height;
		camera.updateProjectionMatrix();
		renderer.setSize(TRAILS.width, TRAILS.height);
	}

	var stats;

	function setupStats() {
		//add the stats for the development version
		if(TRAILS.dev) {
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			$container.append(stats.domElement);
		}
	}

	//EVENTS/////////////////////////////////////////////////////////////////////

	function bindEvents() {
		$(window).resize(sizeTHREE);
	}

	//DRAW LOOP//////////////////////////////////////////////////////////////////

	function render() {
		requestAnimationFrame(render);
		if(TRAILS.dev) {
			stats.update();
		}
		renderer.render(TRAILS.scene, camera);
		TWEEN.update();
	}

	//TRACKS///////////////////////////////////////////////////////////////////
	
	var tracks = [];

	function makeTracks() {
		for (var i = 0; i < 6; i++){
			var t = new TRAILS.Track();
			tracks.push(t);
		}
	}

	//API//////////////////////////////////////////////////////////////////////

	return {
		initialize : initialize,
		context : context,
	}
}();

TRAILS.dev = true;
