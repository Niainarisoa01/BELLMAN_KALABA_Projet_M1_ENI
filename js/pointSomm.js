function Sommet(index, coutTotal) {
	this.index     = index;
	this.coutTotal = coutTotal;
	this.suivant   = null;
        this.visited   = false;
        
        this.rotation = 0;
	this.position = {
		x : 0,
		y : 0
	};

	this.rayon = 17;
	this.color = {
		r : 156,
		g : 156,
		b : 156
	};
}

Sommet.prototype = {

	paint : function(painter) {

		// cercle
		painter.fillStyle   = "rgb(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ")";
		painter.strokeStyle = "black";
		painter.beginPath();
		painter.arc(0, 0, this.rayon, 0, Math.PI * 2);
		//painter.stroke();
		painter.fill();

		// index
		painter.fillStyle = "white";
		painter.textAlign = "center";
		painter.font      = "10pt Calibri, Geneva, Arial";
		painter.fillText(this.index, 0, 5);

		// cout total
		painter.fillStyle = "red";
		painter.textAlign = "center";
		painter.font      = "9pt Calibri, Geneva, Arial";
		painter.fillText(isFinite(this.coutTotal) ? this.coutTotal : "~", 0, -this.rayon - 4);
	},

	advance : function() {}
	
}