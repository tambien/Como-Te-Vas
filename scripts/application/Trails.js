$(function() {
	TRAILS.initialize();
})
/*
 * the main application
 */
var TRAILS = function() {

	//GLOBALS//////////////////////////////////////////////////////////////////

	var versionNumber = "0.0.1";

	var $container;

	var track;

	var loadingBar, hash;

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
		//make the loading bar
		loadingBar = new TRAILS.LoadingBar({
			model : tracks
		});
		//make the hash listener
		hash = new TRAILS.Hash({
			model : tracks
		})
	}

	//THREE////////////////////////////////////////////////////////////////////

	var camera, projector, renderer;

	function setupTHREE() {
		camera = new THREE.PerspectiveCamera(70, 4 / 3, 1, 1000);
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
			stats.domElement.style.right = '0px';
			$container.append(stats.domElement);
		}
	}

	//EVENTS/////////////////////////////////////////////////////////////////////

	function bindEvents() {
		$(window).resize(sizeTHREE);
		bindInfoClicks();
	}

	//DRAW LOOP//////////////////////////////////////////////////////////////////

	function render() {
		requestAnimationFrame(render);
		if(TRAILS.dev) {
			stats.update();
		}
		//renderer.render(TRAILS.scene, camera);
		//TWEEN.update();
	}

	//TRACKS///////////////////////////////////////////////////////////////////
	
	var tracks = new Backbone.Collection();

	function makeTracks() {
		for (var i = 0; i < 6; i++){
			var t = new TRAILS.Track();
			tracks.add(t);
		}
	}

	function playTracks(){
		var time = AudioContext.currentTime + .1;
		tracks.forEach(function(track){
			track.play(time);
		});
	}

	//DIALOG WINDOWS///////////////////////////////////////////////////////////

	function bindInfoClicks(){
		//$("#instructions").click(infoClicked);
		//$("#credits").click(creditsClicked);
	}

	function infoClicked(event){
		event.preventDefault();
		settings = "width=240, height=480, top=20, left=20, scrollbars=no, location=no, directories=no, status=no, menubar=no, toolbar=no, resizable=no, dependent=no";
    	win = window.open('info.html', 'INFO', settings);
    	win.focus();
	}

	function creditsClicked(event){
		event.preventDefault();
		settings = "width=240, height=480, top=20, left=400, scrollbars=no, location=no, directories=no, status=no, menubar=no, toolbar=no, resizable=no, dependent=no";
    	win = window.open('credits.html', 'CREDITS', settings);
    	win.focus();
	}

	//API//////////////////////////////////////////////////////////////////////

	return {
		initialize : initialize,
		tracks : tracks, 
		play : playTracks,
	}
}();

TRAILS.dev = true;

TRAILS.AudioTracks = ['ctv-vocals-lead', 'ctv-vocals-bg', 'ctv-guitar-lead', 'ctv-guitar-rhythm', "ctv-keys-bass-noise", "ctv-drums-perc"];
TRAILS.Scenes = ["green", "space", "swamp", "underwater"];
TRAILS.imgWidth = 1500;
TRAILS.imgHeight = 500;

window.AudioContext = new webkitAudioContext();
var tuna = new Tuna(AudioContext);

//LOADING BAR
TRAILS.LoadingBar = Backbone.View.extend({
	initialize : function(){
		this.setElement($("#loadingScreen"));
		this.listenTo(this.model, "change:loadingProgress", this.updateProgress);
		this.$loaded = this.$el.find("#loadedArea");
	},
	updateProgress : function(){ 
		var total = 0;
		//get the total progress
		this.model.forEach(function(track){
			total += track.get("loadingProgress");
		});
		total /= this.model.length;
		var percentage = parseInt(total * 100);
		var self = this;
		percentage += "%";
		this.$loaded.stop().transition({
			width : percentage,
		}, 100, function(){
			if (percentage === "100%"){
				//make the play button
				var button = $(self.$loaded).find("#playbutton");
				button.css("zIndex", 100);
				button.fadeTo(800, 1);
				var el = self.$el;
				button.click(function(event){
					event.preventDefault();
					el.fadeTo(500, 0, function(){
						el.css({
							zIndex : -100,
						})
						TRAILS.play();
					});
				});
			}
		});
	}
})

TRAILS.Hash = Backbone.View.extend({
	initialize : function(){
		//set the layers initially
		//if there is a hash, decode it
		if (window.location.hash !== ""){
			var scenes = JSON.parse(decodeURIComponent(window.location.hash).slice(1));
			this.model.forEach(function(obj, index){
				obj.set("scene", scenes[index]);
			});
		}
		//listen to layer changes
		this.listenTo(this.model, "change:scene", this.updateHash);
	},
	updateHash : function(){
		//go through each of the scenes and make a scene object
		var scenes = []
		this.model.forEach(function(obj){
			scenes.push(obj.get("scene"));
		});
		window.location.hash = encodeURIComponent(JSON.stringify(scenes));
	}
})
