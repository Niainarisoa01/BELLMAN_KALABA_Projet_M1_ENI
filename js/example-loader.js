// Example Graph Loader - Loads the standard example graph for demonstrations

function loadExampleGraph(liens, scene) {
    // Create 12 vertices
    var vertices = [];
    for (var i = 0; i < 12; i++) {
        vertices.push(liens.ajouterSommet());
    }

    // Define edges: [from_index, to_index, cost]
    var edges = [
        [0, 1, 3], [0, 3, 9], [0, 2, 3],
        [1, 3, 7], [1, 5, 1], [1, 4, 5],
        [2, 6, 2], [2, 3, 2],
        [3, 4, 2], [3, 5, 3], [3, 6, 1], [3, 7, 3],
        [4, 7, 5],
        [5, 7, 4], [5, 8, 2], [5, 9, 5],
        [6, 5, 5], [6, 9, 3], [6, 10, 8],
        [7, 8, 6],
        [8, 9, 2], [8, 11, 8],
        [9, 11, 4],
        [10, 9, 4], [10, 11, 5]
    ];

    // Add all edges
    edges.forEach(function (edge) {
        liens.ajouterLien(new Lien(edge[2], vertices[edge[0]], vertices[edge[1]]));
    });

    // Define vertex positions: {x, y}
    var positions = [
        { x: 260, y: 300 }, // x1
        { x: 360, y: 200 }, // x2
        { x: 360, y: 400 }, // x3
        { x: 380, y: 300 }, // x4
        { x: 470, y: 180 }, // x5
        { x: 520, y: 300 }, // x6
        { x: 500, y: 410 }, // x7
        { x: 575, y: 175 }, // x8
        { x: 700, y: 200 }, // x9
        { x: 700, y: 300 }, // x10
        { x: 700, y: 400 }, // x11
        { x: 850, y: 300 }  // x12
    ];

    // Set vertex positions
    vertices.forEach(function (vertex, i) {
        vertex.position = positions[i];
    });

    // Add vertices to scene if scene is provided
    if (scene) {
        vertices.forEach(function (vertex) {
            scene.addItem(vertex);
        });
    }

    return vertices;
}
