function Lien(cout, precedent, suivant) {
	this.cout      = cout;
	this.precedent = precedent;
	this.suivant   = suivant;
        this.actualtrace = false;
        this.rotation = 0;
	this.position = {
		x : 0,
		y : 0
	};
}

Lien.prototype = {

	paint : function(painter) {

		var precedent = this.precedent;
		var suivant   = this.suivant;
		var line      = new Line(precedent.position, suivant.position);
		var length    = line.length() - suivant.rayon;
		var angle     = line.getAngle();
		
		if(length - precedent.rayon > 0) {
			// ligne
                        if(!this.actualtrace)
                            painter.strokeStyle = "rgb(100, 100, 100)";
                        else
                            painter.strokeStyle = "rgb(3, 204, 174)";
			painter.beginPath();

			painter.translate(precedent.position.x, precedent.position.y);
			painter.rotate(-angle);
			painter.moveTo(precedent.rayon, 0);
			painter.lineTo(length, 0);

			painter.stroke();


			// flèche
			painter.beginPath();

			painter.moveTo(length - 7, -5);
			painter.lineTo(length, 0);
			painter.lineTo(length - 7,  5);

			painter.stroke();


			// cout
			painter.translate((length + precedent.rayon) / 2, angle < - Math.PI / 2 ? (angle < - Math.PI + Math.PI / 5 ? -12 : -8) : (angle > 3 * Math.PI / 4 ? -12 : -4));
			painter.rotate(angle);

			painter.font      = "9pt Calibri, Geneva, Arial";
			painter.textAlign = angle < -0.3 ? "left" : (angle > 0.3 ? "right" : "center");
			painter.fillStyle = "#000";
			painter.fillText(this.cout, 0, 0);
		}
	},

	advance : function() {}
	
}