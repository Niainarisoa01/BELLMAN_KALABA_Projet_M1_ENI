export class Sommet {
    constructor(index, coutTotal) {
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

        this.rayon = 20;
        this.color = {
            r: 156,
            g: 156,
            b: 156
        };
    }

    paint(painter) {
        // Flat Design with subtle shadow
        painter.shadowColor = "rgba(0, 0, 0, 0.15)";
        painter.shadowBlur = 6;
        painter.shadowOffsetX = 3;
        painter.shadowOffsetY = 3;

        // Main circle
        painter.fillStyle = "rgb(" + this.color.r + ", " + this.color.g + ", " + this.color.b + ")";
        painter.strokeStyle = "white";
        painter.lineWidth = 2;

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
        painter.font = "bold 12pt 'Segoe UI', sans-serif";
        painter.fillText(this.index, 0, 1);

        // Total Cost Label (Badge style)
        if (isFinite(this.coutTotal)) {
            var costText = this.coutTotal;
            painter.font = "bold 10pt 'Segoe UI', sans-serif";
            var metrics = painter.measureText(costText);
            var bgWidth = metrics.width + 8;
            var bgHeight = 16;

            painter.fillStyle = "#e74c3c";
            painter.beginPath();
            painter.roundRect(-bgWidth / 2, -this.rayon - 20, bgWidth, bgHeight, 4);
            painter.fill();

            painter.fillStyle = "white";
            painter.fillText(costText, 0, -this.rayon - 12);
        } else {
            painter.fillStyle = "#7f8c8d";
            painter.font = "bold 12pt 'Segoe UI', sans-serif";
            painter.fillText("∞", 0, -this.rayon - 12);
        }
    }

    advance() { }
}
