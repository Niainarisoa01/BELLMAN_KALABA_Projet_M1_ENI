window.onload = function() {
    var liens = new ConteneurLiens();

    var canvas = document.getElementById("canvas");

    var itemButton = document.getElementById("btn1");
    var dragButton = document.getElementById("btn2");
    var updateButton = document.getElementById("btn3");
    var deleteButton = document.getElementById("btn4");
    var debutButton = document.getElementById("btn5");
    var finButton = document.getElementById("btn6");
    var chercherBouton = document.getElementById("btn7");

    var gs = new Scene(canvas);

    for(var lien of liens.liens)
        gs.addItem(lien);

    gs.paint();

    var viewManager = new ViewManager(gs, liens);

    function getMousePosition(element, event) {
        return {
            x : event.clientX - element.offsetLeft,
            y : event.clientY - element.offsetTop
        };
    }

    canvas.addEventListener('mousedown', function(event) {
        viewManager.onMouseDown(getMousePosition(canvas, event));
    });

    canvas.addEventListener('mousemove', function(event) {
        viewManager.onMouseMove(getMousePosition(canvas, event));
    });

    canvas.addEventListener('mouseup', function(event) {
        viewManager.onMouseUp(getMousePosition(canvas, event));
    });

    canvas.addEventListener('click', function(event) {
        viewManager.onClick(getMousePosition(canvas, event));
    });

    canvas.addEventListener('dblclick', function(event) {
        viewManager.onDblClick(getMousePosition(canvas, event));
    });

    chercherBouton.addEventListener('click', function(event) {
                liens.setIsMin(false);
                liens.setView(viewManager);
                liens.main();
    });

    dragButton.addEventListener('click', function(event) {
        viewManager.mode = "drag";
    });

    itemButton.addEventListener('click', function(event) {
        viewManager.mode = "item";
    });

    updateButton.addEventListener('click', function(event) {
        viewManager.mode = "update";
    });

    deleteButton.addEventListener('click', function(event) {
        viewManager.mode = "delete";
    });

    debutButton.addEventListener('click', function(event) {
        viewManager.mode = "debut";
        
    });
    
    finButton.addEventListener('click', function(event) {
        viewManager.mode = "fin";
    });
}