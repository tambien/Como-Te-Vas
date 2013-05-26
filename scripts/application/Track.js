/*
 * TRACK
 */
TRAILS.trackNumber = 0;

TRAILS.Track = Backbone.Model.extend({

	defaults : function() {
		//get and then increment the track number
		var trackNum = TRAILS.trackNumber;
		TRAILS.trackNumber++;
		return {
			trackNumber : trackNum,
			scene : 'green',
			loaded : false,
			loadedCount : 0, 
			loadingProgress : 0,
		}
	},
	initialize : function(attributes, options) {
		//add the views
		this.view = new TRAILS.Track.View({
			model : this
		});
		this.sceneSelector = new TRAILS.Track.Selector({
			model : this,
		})
		this.audio = new TRAILS.Track.Audio({
			model : this,
		})
		this.on("change:loadedCount", this.somethingLoaded);
	},
	setScene : function(model, scene){
		
	},
	somethingLoaded : function(model, loadedCount){
		var total = TRAILS.Scenes.length + 1;
		this.set('loadingProgress', loadedCount / total);
		if (loadedCount === total){
			this.set("loaded", true);
		}
	},
	play : function(time){
		if (this.get("loaded")){
			this.audio.play(time);
		}
	}
})

/*
 AUDIO TRACK
 */

 TRAILS.Track.Audio = Backbone.View.extend({
 	//load the audio track
 	initialize : function(){
 		var trackNum = this.model.get("trackNumber");
 		var url = "./audio/"+TRAILS.AudioTracks[trackNum]+".mp3";
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		var self = this;
		// Decode asynchronously
		request.onload = function() {
			AudioContext.decodeAudioData(request.response, function(buffer) {
				self.buffer = buffer;
				self.model.set("loadedCount", self.model.get("loadedCount") + 1);
			});
		}
		request.send();
		this.listenTo(this.model, "change:scene", this.trackChange);
		//make all the connections
		this.output = AudioContext.createGainNode();
		//connect it to the effects
		this.mixer = {};
		this.makeMixer();
	}, 
	trackChange : function(model, scene){
		var now = AudioContext.currentTime;
		var prev = this.model.previous("scene");
		//mute the previous scene
		var prevGain = this.mixer[prev];
		if (prevGain){
			prevGain.gain.setValueAtTime(1, now);
			prevGain.gain.linearRampToValueAtTime(0, now + .1);
		}
		var currentGain = this.mixer[scene];
		if (currentGain){
			currentGain.gain.setValueAtTime(0, now);
			currentGain.gain.linearRampToValueAtTime(1, now + .1);
		}
	},
	makeMixer : function(){
		for (var i = 0; i < TRAILS.Effects.length; i++){
			var effect = TRAILS.Effects[i];
			var gain = AudioContext.createGainNode();
			this.mixer[effect.id] = gain;
			this.output.connect(gain);
			//start at 0
			if (effect.id !== "green"){
				gain.gain.value = 0;
			}
			//connect the gain to the effect
			gain.connect(effect.input);
		}
	},
	play : function(time){
		//make a buffer source node
		var source = AudioContext.createBufferSource(); // creates a sound source  
		//connect it up
		source.buffer = this.buffer;                    // tell the source which sound to play
  		source.connect(this.output);       // connect the source to the context's destination (the speakers)
		//play the buffer
		source.start(0);   
	}
 })

/*
 * TRACK VIEW
 */

TRAILS.Track.View = Backbone.View.extend({

	initialize : function() {
		//listen for changes
		this.listenTo(this.model, "change:scene", this.changeScene);
		this.loadScenes();
		this.setScene();
	},
	setScene : function() {
		var self = this;
		var image = THREE.ImageUtils.loadTexture("./images/" + self.model.get("scene") + "_" + "0" + self.model.get("trackNumber") + ".png", new THREE.UVMapping(), function() {
			image.needsUpdate = true;
			image.wrapS = THREE.RepeatWrapping;
			image.repeat.set(1, 1);

			var material = new THREE.MeshBasicMaterial({
				map : image,
				transparent : true,
				//side : THREE.DoubleSide,
				overdraw : true,
				//wireframeLinewidth: 1000,
				//blending: THREE.AdditiveBlending,

			})
			self.sprite = new THREE.Mesh(new THREE.PlaneGeometry(2048, 512), material);
			//self.sprite.dynamic = true
			//set the z value based on the track number
			self.sprite.position.z = -self.model.get("trackNumber");
			TRAILS.scene.add(self.sprite);
			//render for the first time
			//self.render(self.model);
			self.scrollBackground();
		});
	},
	loadScenes : function(){
		for (var i = 0; i < TRAILS.Scenes.length; i ++){
			var scene = TRAILS.Scenes[i];
			var self = this;
			var image = THREE.ImageUtils.loadTexture("./images/" + scene + "_" + "0" + self.model.get("trackNumber") + ".png", new THREE.UVMapping(), function() {
				self.model.set("loadedCount", self.model.get("loadedCount") + 1);
			});
		}
	},
	changeScene : function(model, scene){
		var self= this;
		this.sprite.material.map = THREE.ImageUtils.loadTexture("./images/" + scene + "_" + "0" + model.get("trackNumber") + ".png", new THREE.UVMapping(), function() {
			self.sprite.material.map.needsUpdate = true;
			self.sprite.material.map.wrapS = THREE.RepeatWrapping;
			self.sprite.material.map.repeat.set(1, 1);
		});
	},
	scrollBackground : function() {
		var scrollSpeed = (this.model.get("trackNumber") + 1) * 8000;
		var self = this;
		var tween = new TWEEN.Tween({
			left : 0,
		}).to({
			left : 1,
		}, scrollSpeed).easing(TWEEN.Easing.Linear.None).onUpdate(function() {
			self.sprite.material.map.offset.x = this.left;
		}).start().repeat(Infinity);
	}
});

TRAILS.Track.Selector = Backbone.View.extend({
	className : "sceneSelector",
	
	events : {
		"mouseenter #trackTitle" : "openOptions",
		"click #sceneContainer .sceneOption" : "selectOption",
		"mouseleave" : "closeOptions"
	},

	initialize : function() {
		var template = _.template($("#sceneSelectorTemplate").html());
		this.$el.html(template(this.model.attributes));
		this.$el.appendTo($("#scenerySelectorContainer"));
		this.$indicator = this.$el.find("#trackInstrumentIndicator");
		this.$trackTitle = this.$el.find("#trackTitle");
		console.log(TRAILS.AudioTracks[this.model.get("trackNumber")]);
		this.$trackTitle.html(TRAILS.AudioTracks[this.model.get("trackNumber")]);
		this.$sceneContainer = this.$el.find("#sceneContainer");
		//position the element relative to the bottom based on the track number
		var pos = (this.model.get("trackNumber") / 6) * 100;
		this.$el.css({
			bottom : pos + "%",
		})
		//get the selected option
		this.$selected = this.$el.find(".selected");
		//listen for scene changes
		this.listenTo(this.model, "change:scene", this.render);
		//render for the first time
		this.render(this.model);

	},
	render : function(model){
		var clone = this.$selected.clone();
		clone.removeClass("selected");
		console.log(clone);
		this.$indicator.html(clone);
	},
	openOptions : function(event){
		this.$el.stop().transition({
			width: "480px",
		}, 300);
	}, 
	closeOptions : function(event){
		this.$el.stop().transition({
			width: "80px",
		}, 300)
	}, 
	selectOption : function(event){
		event.preventDefault();
		//remove the selector class from the other options
		//this.$selected.find(".selected").remove();
		this.$selected.removeClass('selected');
		this.$selected = $(event.target);
		//add it to this selector
		this.$selected.addClass('selected');
		//get the id of the target
		var scene = this.$selected.attr("id");
		this.model.set("scene", scene);
	}
})