export class Scene {
    constructor(canvas) {
        this.items = new Array();
        this.painter = canvas.getContext('2d');
        this.clearAll = true;
        this.canvas = canvas;
        this.option = {};
    }

    addItem(item) {
        item.scene = this;
        this.items.push(item);
    }

    width() {
        return this.canvas.width;
    }

    height() {
        return this.canvas.height;
    }

    removeItem(item) {
        var index = this.items.indexOf(item);
        if (index >= 0) {
            this.items.splice(index, 1);
            return true;
        }

        return false;
    }

    paint() {
        var item;
        for (var item of this.items) {
            this.painter.save();

            //operations : 
            this.painter.translate(item.position.x, item.position.y);
            this.painter.rotate(item.rotation);
            item.paint(this.painter, this.option);

            this.painter.restore();
        }
    }

    clear() {
        this.painter.clearRect(0, 0, this.width(), this.height());
    }

    advance() {
        this.clear();
        for (var item of this.items)
            item.advance();
        this.paint();
    }

    setOption(option) {
        this.option = option;
    }
}
