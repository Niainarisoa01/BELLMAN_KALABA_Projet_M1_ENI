import assert from "node:assert/strict";
import { GraphNode, GraphEdge, BellmanKalabaSolver } from "../src/main.js";

const edgeData = [
  [1,2,5],[1,3,4],[1,4,6],
  [2,5,4],[2,6,3],[2,7,8],[3,5,5],[3,6,2],[3,8,5],[4,6,3],[4,7,4],[4,8,1],
  [5,9,4],[5,10,6],[6,9,5],[6,10,3],[6,11,4],[7,10,2],[7,11,5],[7,12,3],[8,11,6],[8,12,2],
  [9,13,4],[9,14,7],[10,13,2],[10,14,4],[10,15,6],[11,14,3],[11,15,2],[12,14,5],[12,15,4],
  [13,16,3],[13,17,5],[14,16,4],[14,17,2],[15,16,6],[15,17,3],[16,18,5],[17,18,7]
];
const nodes = Array.from({ length: 18 }, (_, index) => new GraphNode(index + 1, 0, 0));
const edges = edgeData.map(([from, to, weight], index) => new GraphEdge(index + 1, from, to, weight));
const result = new BellmanKalabaSolver("min").solve(nodes, edges, 1, 18);
assert.equal(result.ok, true);
assert.equal(result.paths[0][0], 1);
assert.equal(result.paths[0].at(-1), 18);
assert.equal(result.paths.length >= 1, true);
console.log(`complex example: ${nodes.length} sommets, ${edges.length} arcs, coût optimal ${result.cost}, ${result.paths.length} chemin(s)`);
