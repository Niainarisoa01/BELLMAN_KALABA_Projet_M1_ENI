
function Scene(canvas) {
	this.items        = new Array();
	this.painter      = canvas.getContext('2d');
	this.clearAll     = true;
	this.canvas       = canvas;
	this.option       = {};
}

Scene.prototype = {
	addItem : function(item) {
		item.scene = this;
		this.items.push(item);
	},
	
	width : function() {
		return this.canvas.width;
	},
	
	height : function() {
		return this.canvas.height;
	},
	
	removeItem : function(item) {
		var index = this.items.indexOf(item);
		if(index >= 0) {
			this.items.splice(index, 1);
			return true;
		}

		return false;
	},
	
	paint : function() {
		var item;
		for(var item of this.items) {
			this.painter.save();
			
			//operations : 
			this.painter.translate(item.position.x, item.position.y);
			this.painter.rotate(item.rotation);
			item.paint(this.painter, this.option);
			
			this.painter.restore();
		}
	},

	clear : function() {
		this.painter.clearRect(0, 0, this.width(), this.height());
	},
	
	advance : function() {
		this.clear();
		for(var item of this.items)
			item.advance();
		this.paint();
	},

	setOption : function(option) {
		this.option = option;
	}
}
