export class Line {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }

    dx() {
        return this.point2.x - this.point1.x;
    }

    dy() {
        return this.point2.y - this.point1.y;
    }

    length() {
        return Math.sqrt(this.dx() * this.dx() + this.dy() * this.dy());
    }

    getAngle() {
        var angle = Math.acos(this.dx() / this.length());
        if (this.dy() > 0)
            angle = - angle;
        return angle;
    }
}

export function wait(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}
