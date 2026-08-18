import assert from "node:assert/strict";
import { GraphNode, GraphEdge, BellmanKalabaSolver } from "../src/main.js";

const edgeData = [
  [1,2,4],[1,3,2],[1,4,3],[2,5,4],[2,6,6],[3,6,2],[3,7,3],[3,8,4],[4,8,2],[4,9,5],
  [5,10,3],[5,11,5],[6,10,4],[6,12,3],[7,11,2],[7,12,4],[7,13,6],[8,12,2],[8,13,3],[8,14,4],[9,13,2],[9,14,5],
  [10,15,4],[10,16,6],[11,15,2],[11,17,4],[12,16,3],[12,17,3],[12,18,5],[13,17,2],[13,18,4],[13,19,3],[14,18,2],[14,19,5],
  [15,20,3],[15,21,5],[16,20,4],[16,22,2],[17,21,2],[17,22,3],[17,23,4],[18,22,2],[18,23,2],[18,24,3],[19,23,3],[19,24,1],
  [20,25,4],[21,25,3],[21,26,5],[22,25,2],[22,26,2],[23,26,3],[24,25,4],[24,26,1],[25,27,5],[26,27,3]
];
const nodes = Array.from({ length: 27 }, (_, index) => new GraphNode(index + 1, 0, 0));
const edges = edgeData.map(([from, to, weight], index) => new GraphEdge(index + 1, from, to, weight));
const result = new BellmanKalabaSolver("min").solve(nodes, edges, 1, 27);
assert.equal(result.ok, true);
assert.equal(nodes.length, 27);
assert.equal(edges.length, 56);
assert.equal(result.cost, 16);
assert.equal(result.paths.length >= 1, true);
assert.equal(result.paths[0][0], 1);
assert.equal(result.paths[0].at(-1), 27);
console.log(`starter27 example: ${nodes.length} sommets, coût optimal ${result.cost}, chemin ${result.paths[0].join(" → ")}`);
