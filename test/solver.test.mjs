import assert from "node:assert/strict";
import { GraphNode, GraphEdge, BellmanKalabaSolver } from "../src/main.js";

const nodes = (count) => Array.from({ length: count }, (_, index) => new GraphNode(index + 1, 0, 0));
const edges = (pairs) => pairs.map(([id, from, to, weight]) => new GraphEdge(id, from, to, weight));

const baseNodes = nodes(4);
const baseEdges = edges([[1,1,2,3],[2,2,4,4],[3,1,3,1],[4,3,4,10],[5,2,3,2]]);
const min = new BellmanKalabaSolver("min").solve(baseNodes, baseEdges, 1, 4);
assert.equal(min.ok, true);
assert.equal(min.cost, 7);
assert.deepEqual(min.paths, [[1,2,4]]);

const max = new BellmanKalabaSolver("max").solve(baseNodes, baseEdges, 1, 4);
assert.equal(max.ok, true);
assert.equal(max.cost, 15);
assert.deepEqual(max.paths, [[1,2,3,4]]);

const tie = new BellmanKalabaSolver("min").solve(nodes(4), edges([[1,1,2,5],[2,2,4,5],[3,1,3,5],[4,3,4,5]]), 1, 4);
assert.equal(tie.ok, true);
assert.equal(tie.multiple, true);
assert.equal(tie.paths.length, 2);

const cycle = new BellmanKalabaSolver("min").solve(nodes(3), edges([[1,1,2,1],[2,2,3,1],[3,3,1,1]]), 1, 3);
assert.equal(cycle.ok, false);
assert.match(cycle.message, /cycle/i);

const disconnected = new BellmanKalabaSolver("min").solve(nodes(3), edges([[1,1,2,1]]), 1, 3);
assert.equal(disconnected.ok, false);
assert.match(disconnected.message, /Aucun chemin/i);

console.log("solver tests: 5 scénarios validés");
