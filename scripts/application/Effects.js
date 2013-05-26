
//the effect
TRAILS.Effect = Backbone.Model.extend({
	initialize : function(attributes, options){
		this.input = AudioContext.createGainNode();
		this.output = AudioContext.createGainNode();
		this.output.connect(AudioContext.destination);
		if (options.makeEffect){
			_.bind(options.makeEffect, this)();
		}
	},
	//make effect
	makeEffect : function(){

	},	
})

//the collection
TRAILS.Effects = [];

(function(){
	//underwater
	var underwater = new TRAILS.Effect({
		id : "underwater"
	}, {
		makeEffect : function(){
			this.filter = new tuna.Filter({
				frequency: 500,         //20 to 22050
				Q: 10,                  //0.001 to 100
				gain: -10,               //-40 to 40
				wetLevel: .9,             //0 to 1+
				dryLevel : .1,
				filterType: 0,         //lowpass
             });
			this.filter.filterType = 0;
			this.tremolo = new tuna.Tremolo({
				wetLevel : .5,
				dryLevel : .5,
				intensity: 0.2,    //0 to 1
				rate: 10, 
			});
			this.reverb = new tuna.Convolver({
				highCut: 22050,                         //20 to 22050
				lowCut: 20,                             //20 to 22050
				dryLevel: .2,                            //0 to 1+
				wetLevel: .8,                            //0 to 1+
				level: 1,                               //0 to 1+, adjusts total output of both wet and dry
				impulse: "./audio/ir.wav",    //the path to your impulse response
				bypass: 0
			});
			this.input.connect(this.filter.input);
			this.filter.connect(this.tremolo.input);
			this.tremolo.connect(this.reverb.input);
			this.reverb.connect(this.output);
		}
	});
	TRAILS.Effects.push(underwater);
	
	//red
	var space = new TRAILS.Effect({
		id : "space"
	}, {
		makeEffect : function(){
			this.phaser = new tuna.Phaser({
				rate: 10,                     //0.01 to 8 is a decent range, but higher values are possible
				depth: 0.8,                    //0 to 1
				feedback: 0.2,                 //0 to 1+
				stereoPhase: 30,               //0 to 180
				baseModulationFrequency: 700,  //500 to 1500
				bypass: 0, 
				wetLevel: 1,    //0 to 1+
				dryLevel: 0,  
             });
			this.reverb = new tuna.Convolver({
				highCut: 22050,                         //20 to 22050
				lowCut: 300,                             //20 to 22050
				dryLevel: .3,                            //0 to 1+
				wetLevel: .7,                            //0 to 1+
				level: 1,                               //0 to 1+, adjusts total output of both wet and dry
				impulse: "./audio/feedback-spring.wav",    //the path to your impulse response
				bypass: 0
			});
			this.comb = new tuna.Convolver({
				highCut: 22050,                         //20 to 22050
				lowCut: 20,                             //20 to 22050
				dryLevel: .9,                            //0 to 1+
				wetLevel: .1,                            //0 to 1+
				level: 1,                               //0 to 1+, adjusts total output of both wet and dry
				impulse: "./audio/comb-square1.wav",    //the path to your impulse response
				bypass: 0
			});
			this.input.connect(this.phaser.input);
			this.phaser.connect(this.reverb.input);
			this.reverb.connect(this.output);
		}
	});
	TRAILS.Effects.push(space);

	//green
	var green = new TRAILS.Effect({
		id : "green"
	}, {
		makeEffect : function(){
			this.input.connect(this.output);
		}
	});
	TRAILS.Effects.push(green);

	//swamp
	var swamp = new TRAILS.Effect({
		id : "swamp"
	}, {
		makeEffect : function(){
            this.chorus = new tuna.Chorus({
                rate: 1.5,         //0.01 to 8+
                feedback: 0.2,     //0 to 1+
                delay: 0.0045,     //0 to 1
                bypass: 0,          //the value 1 starts the effect as bypassed, 0 or 1
                wetLevel: .5,    //0 to 1+
                dryLevel: .5,       //0 to 1+
             });
			this.reverb = new tuna.Convolver({
				highCut: 22050,                         //20 to 22050
				lowCut: 20,                             //20 to 22050
				dryLevel: .2,                            //0 to 1+
				wetLevel: .8,                            //0 to 1+
				level: 1,                               //0 to 1+, adjusts total output of both wet and dry
				impulse: "./audio/cosmic-ping.wav",    //the path to your impulse response
				bypass: 0
			});
            this.input.connect(this.chorus.input);
            this.chorus.connect(this.reverb.input);
            this.reverb.connect(this.output);
		}
	});
	TRAILS.Effects.push(swamp);

	//cave
	var cave = new TRAILS.Effect({
		id : "cave"
	}, {
		makeEffect : function(){
			this.delay = new tuna.Delay({
                feedback: 0.2,    //0 to 1+
                delayTime: 125,    //how many milliseconds should the wet signal be delayed? 
                wetLevel: 0.25,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 20,        //cutoff frequency of the built in highpass-filter. 20 to 22050
                bypass: 0
            });
			this.reverb = new tuna.Convolver({
				highCut: 22050,                         //20 to 22050
				lowCut: 500,                             //20 to 22050
				dryLevel: .6,                            //0 to 1+
				wetLevel: .6,                            //0 to 1+
				level: 1,                               //0 to 1+, adjusts total output of both wet and dry
				impulse: "./audio/echo-chamber.wav",    //the path to your impulse response
				bypass: 0
			});
            this.input.connect(this.delay.input);
            this.delay.connect(this.reverb.input);
            this.reverb.connect(this.output);
		}
	});
	TRAILS.Effects.push(cave);


}())