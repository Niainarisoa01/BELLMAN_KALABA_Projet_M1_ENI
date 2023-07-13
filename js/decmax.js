window.onload = function() {
    var liens = new ConteneurLiens();

    var canvas = document.getElementById("canvas");

    var dragButton = document.getElementById("drag");
    var itemButton = document.getElementById("item");
    var updateButton = document.getElementById("update");
    var deleteButton = document.getElementById("delete");
            var debutButton = document.getElementById("debut");
            var finButton = document.getElementById("fin");

    var chercherBouton = document.getElementById("chercher");
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