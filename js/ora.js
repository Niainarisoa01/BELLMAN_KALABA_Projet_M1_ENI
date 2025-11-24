
var ANIMATION_INTERVAL = 1000 / 60;

function Timer(options) {

	this.defaultOptions = {

		begin    : "undefined",
		end      : "undefined",
		duration : 0,

		timeInterval : ANIMATION_INTERVAL,

		functionDefine : {
			equation : function(x) {
				return 0;
			}
		},

		onStart   : function(){},
		onTimeout : function(){},
		onStop    : function(){},
		onPaused  : function(){}
	};

	this.stopped = true;
	this.paused  = false;

	this._initOptions(this.defaultOptions, options);
};

Timer.prototype = {
	// private
	_initOptions : function(defaultOptions, givenOptions) {
		for(var option in defaultOptions)
			if(typeof givenOptions[option] != "undefined")
				defaultOptions[option] = givenOptions[option];
	},

	_doLoop : function() {
		var self = this;
		var ti   = parseInt(this.defaultOptions.timeInterval);
		if(ti <= 0 || ti == ANIMATION_INTERVAL)
			this.requestAnimFrame(function() {self._loop()});
		else
			setTimeout(function() {self._loop()}, self.defaultOptions.timeInterval);
	},

	_loop : function() {
		if(typeof this.point != "undefined") {
			this.point.x   += this.i;
			this.point.y    = this.defaultOptions.functionDefine.equation(this.point.x);
			this.point.time = this.i * this.defaultOptions.timeInterval;
			if(!this.paused)
				this.defaultOptions.onTimeout(this.point);
			else 
				this.defaultOptions.onPaused();
			if((this.i > 0 ? this.point.x < this.defaultOptions.end : (this.i < 0 ? point.x > this.defaultOptions.end : false)) && !this.stopped) 
				this._doLoop();
			else
				this.defaultOptions.onStop();
		} else {
			if(!this.paused)
				this.defaultOptions.onTimeout();
			else 
				this.defaultOptions.onPaused();
			if(!this.stopped)
				this._doLoop();
			else
				this.defaultOptions.onStop();
		}
	},

	// public
	start : function(options) {
		if(typeof options != "undefined") {
			this._initOptions(this.defaultOptions, options);
			this.i = (this.defaultOptions.end - this.defaultOptions.begin) * this.defaultOptions.timeInterval/this.defaultOptions.duration;
			this.point = {
				x    : this.defaultOptions.begin - this.i,
				y    : 0,
				time : 0
			};
		}

		this.stopped = false;
		this.defaultOptions.onStart();
		this._loop();
	},

	stop : function() {
		this.stopped = true;
	},

	play : function(yes) {
		this.paused = !yes;
		if(this.paused) this.defaultOptions.onPaused();
		else this.defaultOptions.onStart();
	},

	setTimeInterval : function(interval) {
		if(parseInt(interval) > 0) this.defaultOptions.timeInterval = interval;
	},
	
	initTimeInterval : function() {
		this.defaultOptions.timeInterval = ANIMATION_INTERVAL;
	},

	requestAnimFrame : function() { 
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function (callback) {
					window.setTimeout(callback, ANIMATION_INTERVAL); 
				}; 
	}

}
