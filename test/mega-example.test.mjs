import assert from "node:assert/strict";
import { GraphNode, GraphEdge, BellmanKalabaSolver } from "../src/main.js";

const edgeData = [];
const branchSize = 23;
for (let branch = 0; branch < 5; branch += 1) {
  const first = 2 + branch * branchSize;
  edgeData.push([1, first, 1]);
  for (let offset = 0; offset < branchSize - 1; offset += 1) edgeData.push([first + offset, first + offset + 1, 1]);
  edgeData.push([first + branchSize - 1, 117, 1]);
}
edgeData.push([1, 118, 10], [118, 119, 10], [119, 120, 10], [120, 117, 10]);

const nodes = Array.from({ length: 120 }, (_, index) => new GraphNode(index + 1, 0, 0));
const edges = edgeData.map(([from, to, weight], index) => new GraphEdge(index + 1, from, to, weight));
const result = new BellmanKalabaSolver("min").solve(nodes, edges, 1, 117);

assert.equal(result.ok, true);
assert.equal(nodes.length, 120);
assert.equal(edges.length, 124);
assert.equal(result.cost, 24);
assert.equal(result.paths.length, 5);
assert.equal(new Set(result.paths.map((path) => path.join("→"))).size, 5);
assert.equal(result.multiple, true);
console.log(`mega example: ${nodes.length} sommets, ${edges.length} arcs, ${result.paths.length} solutions optimales de coût ${result.cost}`);
