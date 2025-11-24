import { BellmanKalabaAlgorithm } from './core/BellmanKalaba.js';
import { Scene } from './view/Scene.js';
import { ViewManager } from './controllers/InteractionManager.js';
import { loadExampleGraph, loadMultiPathGraph } from './utils/GraphLoader.js';

export function initializeBellmanApp(config) {
    config = config || {};

    // Create algorithm instance
    var liens = new BellmanKalabaAlgorithm({
        isMin: config.isMin !== undefined ? config.isMin : true,
        animationDelay: config.animationDelay || 500
    });

    var canvas = document.getElementById("canvas");
    var container = document.getElementById("canvasContainer");

    // Resize canvas to fit container
    function resizeCanvas() {
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            if (typeof gs !== 'undefined') {
                gs.paint();
            }
        }
    }

    // Initial resize
    resizeCanvas();

    // Resize on window change
    window.addEventListener('resize', resizeCanvas);

    var gs = new Scene(canvas);

    // Load example graph if provided
    if (config.loadExample) {
        if (config.exampleType === 'multi') {
            loadMultiPathGraph(liens, gs);
        } else {
            loadExampleGraph(liens, gs);
        }
        // Auto-center graph
        liens.centerGraph(canvas.width, canvas.height);
    }

    // Add existing links to scene
    for (var lien of liens.liens)
        gs.addItem(lien);

    gs.paint();

    var viewManager = new ViewManager(gs, liens);

    // Button configuration
    var buttonIds = config.buttonIds || {
        item: "btn1",
        drag: "btn2",
        update: "btn3",
        delete: "btn4",
        debut: "btn5",
        fin: "btn6",
        chercher: "btn7"
    };

    // Get button elements
    var itemButton = document.getElementById(buttonIds.item);
    var dragButton = document.getElementById(buttonIds.drag);
    var updateButton = document.getElementById(buttonIds.update);
    var deleteButton = document.getElementById(buttonIds.delete);
    var debutButton = document.getElementById(buttonIds.debut);
    var finButton = document.getElementById(buttonIds.fin);
    var chercherBouton = document.getElementById(buttonIds.chercher);

    // Mouse position helper
    function getMousePosition(element, event) {
        var rect = element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    // Canvas event listeners
    canvas.addEventListener('mousedown', function (event) {
        viewManager.onMouseDown(getMousePosition(canvas, event));
    });

    canvas.addEventListener('mousemove', function (event) {
        viewManager.onMouseMove(getMousePosition(canvas, event));
    });

    canvas.addEventListener('mouseup', function (event) {
        viewManager.onMouseUp(getMousePosition(canvas, event));
    });

    canvas.addEventListener('click', function (event) {
        viewManager.onClick(getMousePosition(canvas, event));
    });

    canvas.addEventListener('dblclick', function (event) {
        viewManager.onDblClick(getMousePosition(canvas, event));
    });

    // Button event listeners
    if (chercherBouton) {
        chercherBouton.addEventListener('click', function (event) {
            liens.setIsMin(config.isMin);
            liens.setView(viewManager);
            liens.main();
        });
    }

    if (dragButton) {
        dragButton.addEventListener('click', function (event) {
            viewManager.mode = "drag";
        });
    }

    if (itemButton) {
        itemButton.addEventListener('click', function (event) {
            viewManager.mode = "item";
        });
    }

    if (updateButton) {
        updateButton.addEventListener('click', function (event) {
            viewManager.mode = "update";
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', function (event) {
            viewManager.mode = "delete";
        });
    }

    if (debutButton) {
        debutButton.addEventListener('click', function (event) {
            viewManager.mode = "debut";
        });
    }

    if (finButton) {
        finButton.addEventListener('click', function (event) {
            viewManager.mode = "fin";
        });
    }

    return {
        liens: liens,
        scene: gs,
        viewManager: viewManager
    };
}
