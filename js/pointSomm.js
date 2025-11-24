function Sommet(index, coutTotal) {
	this.index = index;
	this.coutTotal = coutTotal;
	this.suivant = null;
	this.suivants = []; // Initialize for multi-path
	this.visited = false;

	this.rotation = 0;
	this.position = {
		x: 0,
		y: 0
	};

	this.rayon = 20; // Slightly larger for better visibility
	this.color = {
		r: 156,
		g: 156,
		b: 156
	};
}

Sommet.prototype = {

	paint: function (painter) {
		// Shadow
		painter.shadowColor = "rgba(0, 0, 0, 0.3)";
		painter.shadowBlur = 5;
		painter.shadowOffsetX = 2;
		painter.shadowOffsetY = 2;

		// Gradient for 3D effect
		var gradient = painter.createRadialGradient(-5, -5, 2, 0, 0, this.rayon);
		gradient.addColorStop(0, "rgb(" + Math.min(255, this.color.r + 50) + ", " + Math.min(255, this.color.g + 50) + ", " + Math.min(255, this.color.b + 50) + ")");
		gradient.addColorStop(1, "rgb(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ")");

		painter.fillStyle = gradient;
		painter.strokeStyle = "rgba(0,0,0,0.5)";
		painter.lineWidth = 1;

		painter.beginPath();
		painter.arc(0, 0, this.rayon, 0, Math.PI * 2);
		painter.fill();
		painter.stroke();

		// Reset shadow for text
		painter.shadowColor = "transparent";
		painter.shadowBlur = 0;
		painter.shadowOffsetX = 0;
		painter.shadowOffsetY = 0;

		// Index
		painter.fillStyle = "white";
		painter.textAlign = "center";
		painter.textBaseline = "middle";
		painter.font = "bold 11pt 'Segoe UI', Arial";
		painter.fillText(this.index, 0, 1);

		// Total Cost Label
		painter.fillStyle = "#e74c3c"; // Red color for cost
		painter.font = "bold 10pt 'Segoe UI', Arial";
		// Add a small background for readability if needed, or just text shadow
		painter.shadowColor = "white";
		painter.shadowBlur = 2;
		var costText = isFinite(this.coutTotal) ? this.coutTotal : "∞";
		painter.fillText(costText, 0, -this.rayon - 8);
		painter.shadowColor = "transparent";
	},

	advance: function () { }

}