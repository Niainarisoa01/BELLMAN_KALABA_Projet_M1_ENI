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

    var x1  = liens.ajouterSommet();
    var x2  = liens.ajouterSommet();
    var x3  = liens.ajouterSommet();
    var x4  = liens.ajouterSommet();
    var x5  = liens.ajouterSommet();
    var x6  = liens.ajouterSommet();
    var x7  = liens.ajouterSommet();
    var x8  = liens.ajouterSommet();
    var x9  = liens.ajouterSommet();
    var x10 = liens.ajouterSommet();
    var x11 = liens.ajouterSommet();
    var x12 = liens.ajouterSommet();


    liens.ajouterLien(new Lien(3, x1,  x2));
    liens.ajouterLien(new Lien(9, x1,  x4));
    liens.ajouterLien(new Lien(3,  x1,  x3));
    liens.ajouterLien(new Lien(7,  x2,  x4));
    liens.ajouterLien(new Lien(1,  x2,  x6));
    liens.ajouterLien(new Lien(5,  x2,  x5));
    liens.ajouterLien(new Lien(2, x3,  x7));
    liens.ajouterLien(new Lien(2,  x3,  x4));
    liens.ajouterLien(new Lien(2,  x4,  x5));
    liens.ajouterLien(new Lien(3,  x4,  x6));
    liens.ajouterLien(new Lien(1,  x4,  x7));
    liens.ajouterLien(new Lien(3,  x4,  x8));
    liens.ajouterLien(new Lien(5,  x5,  x8));
    liens.ajouterLien(new Lien(4,  x6,  x8));
    liens.ajouterLien(new Lien(2,  x6,  x9));
    liens.ajouterLien(new Lien(5,  x6,  x10));
    liens.ajouterLien(new Lien(5,  x7,  x6));
    liens.ajouterLien(new Lien(3, x7, x10));
    liens.ajouterLien(new Lien(8,  x7, x11));
    liens.ajouterLien(new Lien(6,  x8, x9));
    liens.ajouterLien(new Lien(2,  x9, x10));
    liens.ajouterLien(new Lien(8,  x9, x12));
    liens.ajouterLien(new Lien(4,  x10, x12));
    liens.ajouterLien(new Lien(4,  x11, x10));
    liens.ajouterLien(new Lien(5,  x11, x12));
    liens.main(x1, x12, true);


    x1.position = {x: 260, y: 300};
    x2.position = {x: 360, y: 200};
    x3.position = {x: 360, y: 400};
    x4.position = {x: 380, y: 300};
    x5.position = {x: 470, y: 180};
    x6.position = {x: 520, y: 300};
    x7.position = {x: 500, y: 410};
    x8.position = {x: 575, y: 175};
    x9.position = {x: 700, y: 200};
    x10.position = {x: 700, y: 300};
    x11.position = {x: 700, y: 400};
    x12.position = {x: 850, y: 300};


    gs.addItem(x1);
    gs.addItem(x2);
    gs.addItem(x3);
    gs.addItem(x4);
    gs.addItem(x5);
    gs.addItem(x6);
    gs.addItem(x7);
    gs.addItem(x8);
    gs.addItem(x9);
    gs.addItem(x10);
    gs.addItem(x11);
    gs.addItem(x12);

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