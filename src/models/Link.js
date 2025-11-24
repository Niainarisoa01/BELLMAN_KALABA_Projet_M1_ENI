import { Line } from '../utils/Geometry.js';

export class Lien {
    constructor(cout, precedent, suivant) {
        this.cout = cout;
        this.precedent = precedent;
        this.suivant = suivant;
        this.actualtrace = false;
        this.isOptimal = false;
        this.rotation = 0;
        this.position = {
            x: 0,
            y: 0
        };
    }

    paint(painter) {
        var precedent = this.precedent;
        var suivant = this.suivant;
        var line = new Line(precedent.position, suivant.position);
        var length = line.length() - suivant.rayon;
        var angle = line.getAngle();

        if (length - precedent.rayon > 0) {
            // ligne - coloration selon le type
            if (this.isOptimal) {
                // Chemin optimal en jaune épais
                painter.strokeStyle = "rgb(255, 170, 1)";
                painter.lineWidth = 3;
            } else if (!this.actualtrace) {
                // Lien normal en gris
                painter.strokeStyle = "rgb(100, 100, 100)";
                painter.lineWidth = 1;
            } else {
                // Animation temporaire en cyan
                painter.strokeStyle = "rgb(3, 204, 174)";
                painter.lineWidth = 2;
            }
            painter.beginPath();

            painter.translate(precedent.position.x, precedent.position.y);
            painter.rotate(-angle);
            painter.moveTo(precedent.rayon, 0);
            painter.lineTo(length, 0);

            painter.stroke();


            // flèche (Filled Arrow)
            painter.beginPath();
            var arrowSize = 10;
            painter.moveTo(length, 0);
            painter.lineTo(length - arrowSize, -arrowSize / 2);
            painter.lineTo(length - arrowSize, arrowSize / 2);
            painter.closePath();
            painter.fillStyle = painter.strokeStyle; // Use same color as line
            painter.fill();


            // cout
            painter.translate((length + precedent.rayon) / 2, angle < - Math.PI / 2 ? (angle < - Math.PI + Math.PI / 5 ? -12 : -8) : (angle > 3 * Math.PI / 4 ? -12 : -4));
            painter.rotate(angle);

            painter.font = "9pt Calibri, Geneva, Arial";
            painter.textAlign = angle < -0.3 ? "left" : (angle > 0.3 ? "right" : "center");
            painter.fillStyle = "#000";
            painter.fillText(this.cout, 0, 0);
        }
    }

    advance() { }
}
