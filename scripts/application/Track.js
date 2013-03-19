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
	},
	setScene : function(model, scene){
		
	}
})

/*
 * TRACK VIEW
 */

TRAILS.Track.View = Backbone.View.extend({

	initialize : function() {
		//listen for changes
		this.listenTo(this.model, "change:scene", this.changeScene);
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
		"mouseenter #trackInstrumentIndicator" : "openOptions",
		"click .sceneOption" : "selectOption",
		"mouseleave" : "closeOptions"
	},

	initialize : function() {
		var template = _.template($("#sceneSelectorTemplate").html());
		this.$el.html(template(this.model.attributes));
		this.$el.appendTo($("#scenerySelectorContainer"));
		this.$sceneContainer = this.$el.find("#sceneContainer");
		//position the element relative to the bottom based on the track number
		var pos = (this.model.get("trackNumber") / 6) * 100;
		this.$el.css({
			bottom : pos + "%",
		})
		//get the selected option
		this.$selected = this.$el.find(".selected");
		//render for the first time
		this.render(this.model);

	},
	render : function(model){
		//center around the selected option
		//get hte left position of the selected one
		//var left = this.$selected.position().left;
		//set the container as negative that amount
		//this.$el.scrollLeft(left);
		//this.$el.css({
		//	width: "80px"
		//})
		
	},
	
	openOptions : function(event){
		this.$el.transition({
			width: "480px",
		}, 300);
	}, 
	closeOptions : function(event){
		this.$el.transition({
			width: "80px",
		}, 300)
	}, 
	
	selectOption : function(event){
		//remove the selector class from the other options
		this.$selected.removeClass("selected");
		this.$selected = $(event.target);
		//add it to this selector
		this.$selected.addClass("selected");
		//get the id of the target
		var scene = this.$selected.attr("id");
		this.model.set("scene", scene);
	}
})