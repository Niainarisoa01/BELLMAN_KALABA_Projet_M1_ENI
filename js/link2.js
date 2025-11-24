
function Line(point1, point2) {
	
	this.point1   = point1;
	this.point2   = point2;
	
}

Line.prototype = {

	dx       : function() {
		return this.point2.x - this.point1.x;
	},
	
	dy       : function() {
		return this.point2.y - this.point1.y;
	},
	
	length   : function() {
		return Math.sqrt(this.dx()*this.dx() + this.dy()*this.dy());
	},
	
	getAngle : function() {
		var angle = Math.acos(this.dx() / this.length());
		if(this.dy() > 0)
			angle = - angle;
		return angle;
	}
	
}