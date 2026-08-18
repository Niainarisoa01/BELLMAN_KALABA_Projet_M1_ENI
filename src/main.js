const STORAGE_KEY = "optigraph-lab-model-v2";

class GraphNode {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }
}

class GraphEdge {
  constructor(id, from, to, weight) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.weight = weight;
  }
}

class BellmanKalabaSolver {
  constructor(mode = "min") {
    this.mode = mode;
    this.isMin = mode === "min";
    this.infinity = this.isMin ? Infinity : -Infinity;
  }

  better(candidate, current) {
    return this.isMin ? candidate < current : candidate > current;
  }

  equal(a, b) {
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9;
  }

  solve(nodes, edges, startId, endId) {
    const nodeIds = new Set(nodes.map((node) => node.id));
    if (!startId || !endId) return { ok: false, message: "Sélectionnez une origine et une destination avant de lancer le calcul." };
    if (!nodeIds.has(startId) || !nodeIds.has(endId)) return { ok: false, message: "L’origine ou la destination n’existe plus dans le modèle." };
    if (nodes.length < 2) return { ok: false, message: "Ajoutez au moins deux sommets pour résoudre un problème." };
    if (edges.some((edge) => !Number.isFinite(edge.weight))) return { ok: false, message: "Chaque arc doit avoir un poids numérique valide." };
    if (edges.some((edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to) || edge.from === edge.to)) return { ok: false, message: "Le graphe contient un arc invalide ou une boucle sur lui-même." };

    const adjacency = new Map(nodes.map((node) => [node.id, []]));
    const indegree = new Map(nodes.map((node) => [node.id, 0]));
    edges.forEach((edge) => {
      adjacency.get(edge.from).push(edge);
      indegree.set(edge.to, indegree.get(edge.to) + 1);
    });

    const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
    const topo = [];
    while (queue.length) {
      const current = queue.shift();
      topo.push(current);
      adjacency.get(current).forEach((edge) => {
        indegree.set(edge.to, indegree.get(edge.to) - 1);
        if (indegree.get(edge.to) === 0) queue.push(edge.to);
      });
    }
    if (topo.length !== nodes.length) {
      return { ok: false, message: "Ce graphe contient un cycle. Bellman-Kalaba attend ici un graphe orienté acyclique. Utilisez « Organiser automatiquement », puis supprimez au moins un arc du cycle avant de relancer le calcul." };
    }

    const values = new Map(nodes.map((node) => [node.id, this.infinity]));
    const paths = new Map(nodes.map((node) => [node.id, []]));
    const steps = [];
    values.set(endId, 0);
    paths.set(endId, [[endId]]);
    steps.push({ nodeId: endId, value: 0, kind: "initialisation", candidates: [], selectedEdgeIds: [] });

    const reversed = [...topo].reverse();
    for (const nodeId of reversed) {
      if (nodeId === endId) continue;
      const candidates = adjacency.get(nodeId)
        .filter((edge) => Number.isFinite(values.get(edge.to)))
        .map((edge) => ({ edge, value: edge.weight + values.get(edge.to) }));
      if (!candidates.length) continue;
      let best = this.infinity;
      candidates.forEach((candidate) => {
        if (this.better(candidate.value, best)) best = candidate.value;
      });
      const optimalCandidates = candidates.filter((candidate) => this.equal(candidate.value, best));
      const nodePaths = [];
      optimalCandidates.forEach(({ edge }) => {
        (paths.get(edge.to) || []).forEach((path) => {
          if (nodePaths.length < 200) nodePaths.push([nodeId, ...path]);
        });
      });
      values.set(nodeId, best);
      paths.set(nodeId, nodePaths);
      steps.push({
        nodeId,
        value: best,
        kind: optimalCandidates.length > 1 ? "égalité" : "propagation",
        candidates: candidates.map(({ edge, value }) => ({ edgeId: edge.id, from: edge.from, to: edge.to, weight: edge.weight, value })),
        selectedEdgeIds: optimalCandidates.map(({ edge }) => edge.id)
      });
    }

    if (!Number.isFinite(values.get(startId))) {
      return { ok: false, message: "Aucun chemin orienté ne relie l’origine à la destination. Vérifiez le sens des arcs." };
    }

    const optimalPaths = paths.get(startId) || [];
    const optimalEdgeIds = new Set();
    optimalPaths.forEach((path) => {
      for (let i = 0; i < path.length - 1; i += 1) {
        const edge = edges.find((item) => item.from === path[i] && item.to === path[i + 1]);
        if (edge) optimalEdgeIds.add(edge.id);
      }
    });
    return {
      ok: true,
      cost: values.get(startId),
      values,
      paths: optimalPaths,
      optimalEdgeIds,
      steps,
      iterations: steps.length,
      multiple: optimalPaths.length > 1,
    };
  }
}

class CanvasRenderer {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.state = state;
    this.ctx = canvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = Math.max(320, rect.width);
    this.height = Math.max(300, rect.height);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.draw();
  }

  point(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  nodeAt(point) {
    for (let i = this.state.nodes.length - 1; i >= 0; i -= 1) {
      const node = this.state.nodes[i];
      if (Math.hypot(node.x - point.x, node.y - point.y) <= 25) return node;
    }
    return null;
  }

  edgeAt(point) {
    let closest = null;
    let distance = 13;
    this.state.edges.forEach((edge) => {
      const from = this.state.nodes.find((node) => node.id === edge.from);
      const to = this.state.nodes.find((node) => node.id === edge.to);
      if (!from || !to) return;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length2 = dx * dx + dy * dy;
      const ratio = length2 ? Math.max(0, Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / length2)) : 0;
      const projection = { x: from.x + ratio * dx, y: from.y + ratio * dy };
      const currentDistance = Math.hypot(point.x - projection.x, point.y - projection.y);
      if (currentDistance < distance) { distance = currentDistance; closest = edge; }
    });
    return closest;
  }

  drawArrow(from, to, color, width, dashed = false) {
    const ctx = this.ctx;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const radius = 27;
    const start = { x: from.x + Math.cos(angle) * radius, y: from.y + Math.sin(angle) * radius };
    const end = { x: to.x - Math.cos(angle) * radius, y: to.y - Math.sin(angle) * radius };
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dashed ? [7, 6] : []);
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(end.x, end.y); ctx.lineTo(end.x - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6)); ctx.lineTo(end.x - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6)); ctx.closePath(); ctx.fill();
    ctx.restore();
    return { start, end };
  }

  drawEdge(edge) {
    const from = this.state.nodes.find((node) => node.id === edge.from);
    const to = this.state.nodes.find((node) => node.id === edge.to);
    if (!from || !to) return;
    const animation = this.state.animation;
    const isOptimal = this.state.highlightEdges.has(edge.id);
    const isEvaluated = animation.evaluatedEdgeIds.has(edge.id);
    const isSelectedCandidate = animation.selectedEdgeIds.has(edge.id);
    const isCurrent = animation.currentEdgeId === edge.id;
    const isSelected = this.state.selectedEdgeId === edge.id;
    const color = isOptimal ? "#ffad63" : isCurrent ? "#ffffff" : isSelectedCandidate ? "#70d8df" : isEvaluated ? "#a7d8ba" : isSelected ? "#70d8df" : "#7184a8";
    const line = this.drawArrow(from, to, color, isOptimal ? 4 : isCurrent ? 4 : isEvaluated ? 3 : isSelected ? 3 : 2, animation.active && isCurrent);
    const midX = (line.start.x + line.end.x) / 2;
    const midY = (line.start.y + line.end.y) / 2;
    const ctx = this.ctx;
    const label = String(edge.weight);
    ctx.save();
    ctx.font = "600 12px Inter, system-ui, sans-serif";
    const width = ctx.measureText(label).width + 16;
    ctx.fillStyle = isOptimal ? "#412d25" : isCurrent ? "#355c46" : isEvaluated ? "#254d38" : "#19243a";
    ctx.strokeStyle = isOptimal ? "#ffad63" : isCurrent ? "#ffffff" : isEvaluated ? "#a7d8ba" : "#334363";
    ctx.lineWidth = isCurrent ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(midX - width / 2, midY - 12, width, 24, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = isOptimal ? "#ffd2a8" : isCurrent ? "#ffffff" : isEvaluated ? "#d5f3df" : "#c6d2e9";
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, midX, midY + 1);
    if (isCurrent && Number.isFinite(animation.currentCandidateValue)) {
      ctx.font = "600 10px 'DM Mono', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`= ${formatNumber(animation.currentCandidateValue)}`, midX, midY - 20);
    }
    ctx.restore();
  }

  drawNode(node) {
    const ctx = this.ctx;
    const isStart = node.id === this.state.startId;
    const isEnd = node.id === this.state.endId;
    const isSelected = node.id === this.state.selectedNodeId;
    const animation = this.state.animation;
    const isCurrent = animation.currentNodeId === node.id;
    const isCompleted = animation.completedNodeIds.has(node.id);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = isCurrent ? 24 : 16; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.arc(node.x, node.y, isCurrent ? 29 : 25, 0, Math.PI * 2);
    ctx.fillStyle = isCurrent ? "#238653" : isStart ? "#1c9da5" : isEnd ? "#e97852" : isCompleted ? "#245b42" : "#283958"; ctx.fill();
    ctx.shadowColor = "transparent"; ctx.lineWidth = isCurrent ? 4 : isSelected ? 3 : 2; ctx.strokeStyle = isCurrent ? "#ffffff" : isSelected ? "#f8fbff" : (isStart || isEnd) ? "#ffd3a9" : isCompleted ? "#a7d8ba" : "#6d83aa"; ctx.stroke();
    if (isStart || isEnd || isCurrent) { ctx.beginPath(); ctx.arc(node.x, node.y, isCurrent ? 36 : 31, 0, Math.PI * 2); ctx.strokeStyle = isCurrent ? "rgba(255,255,255,.55)" : isStart ? "rgba(112,216,223,.35)" : "rgba(255,173,99,.35)"; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = "#ffffff"; ctx.font = "700 14px Inter, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(node.id), node.x, node.y + 1);
    ctx.font = "700 10px Inter, system-ui, sans-serif"; ctx.fillStyle = isCurrent ? "#ffffff" : isStart ? "#9cf0f1" : isEnd ? "#ffd0b1" : isCompleted ? "#a7d8ba" : "#9eafd0"; ctx.fillText(isCurrent ? "EN COURS" : isStart ? "ORIGINE" : isEnd ? "DEST." : isCompleted ? "TRAITÉ" : "SOMMET", node.x, node.y + 42);
    if (isCurrent && Number.isFinite(animation.currentValue)) {
      ctx.font = "600 11px 'DM Mono', monospace";
      const label = `V = ${formatNumber(animation.currentValue)}`;
      const width = ctx.measureText(label).width + 16;
      ctx.fillStyle = "#173d2b";
      ctx.beginPath(); ctx.roundRect(node.x - width / 2, node.y - 51, width, 20, 6); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.fillText(label, node.x, node.y - 41);
    }
    ctx.restore();
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.state.edges.forEach((edge) => this.drawEdge(edge));
    if (this.state.linkPreview) {
      const from = this.state.nodes.find((node) => node.id === this.state.linkPreview.from);
      if (from) this.drawArrow(from, this.state.linkPreview.to, "#70d8df", 2, true);
    }
    this.state.nodes.forEach((node) => this.drawNode(node));
  }
}

class OptiGraphApp {
  constructor() {
    this.body = document.body;
    this.mode = this.body.dataset.mode === "max" ? "max" : "min";
    this.example = this.body.dataset.example || "none";
    this.canvas = document.getElementById("canvas");
    this.container = document.getElementById("canvasContainer");
    this.state = { nodes: [], edges: [], startId: null, endId: null, nextId: 1, nextEdgeId: 1, tool: "node", selectedNodeId: null, selectedEdgeId: null, dragging: null, linkPreview: null, highlightEdges: new Set(), result: null, animation: { active: false, stepIndex: -1, steps: [], currentNodeId: null, currentValue: null, evaluatedEdgeIds: new Set(), selectedEdgeIds: new Set(), completedNodeIds: new Set() } };
    this.history = [];
    this.future = [];
    this.renderer = new CanvasRenderer(this.canvas, this.state);
    this.bindUI();
    if (this.example !== "none") this.loadExample(this.example);
    else this.loadSavedModel();
    this.updateUI();
    this.renderer.draw();
  }

  snapshot() {
    return JSON.stringify({ nodes: this.state.nodes, edges: this.state.edges, startId: this.state.startId, endId: this.state.endId, nextId: this.state.nextId, nextEdgeId: this.state.nextEdgeId });
  }

  restore(snapshot) {
    const value = JSON.parse(snapshot);
    this.state.nodes = value.nodes.map((node) => new GraphNode(node.id, node.x, node.y));
    this.state.edges = value.edges.map((edge) => new GraphEdge(edge.id, edge.from, edge.to, edge.weight));
    this.state.startId = value.startId; this.state.endId = value.endId; this.state.nextId = value.nextId; this.state.nextEdgeId = value.nextEdgeId; this.state.result = null; this.state.highlightEdges.clear(); this.resetAnimation();
    this.updateUI(); this.renderer.draw();
  }

  remember() { this.history.push(this.snapshot()); if (this.history.length > 50) this.history.shift(); this.future = []; }
  commit() { localStorage.setItem(STORAGE_KEY, this.snapshot()); this.updateUI(); this.renderer.draw(); }

  node(id) { return this.state.nodes.find((node) => node.id === id); }
  edge(id) { return this.state.edges.find((edge) => edge.id === id); }

  addNode(x, y) { this.remember(); const node = new GraphNode(this.state.nextId++, x, y); this.state.nodes.push(node); if (!this.state.startId) this.state.startId = node.id; this.commit(); this.showToast(`Sommet ${node.id} ajouté.`); }

  addEdge(from, to, weight) { if (from === to) return this.showToast("Un arc doit relier deux sommets différents.", "error"); if (this.state.edges.some((edge) => edge.from === from && edge.to === to)) return this.showToast("Cet arc orienté existe déjà.", "error"); this.remember(); this.state.edges.push(new GraphEdge(this.state.nextEdgeId++, from, to, weight)); this.state.result = null; this.state.highlightEdges.clear(); this.commit(); this.showToast("Arc ajouté au modèle."); }

  removeNode(id) { this.remember(); this.state.nodes = this.state.nodes.filter((node) => node.id !== id); this.state.edges = this.state.edges.filter((edge) => edge.from !== id && edge.to !== id); if (this.state.startId === id) this.state.startId = null; if (this.state.endId === id) this.state.endId = null; this.state.result = null; this.state.highlightEdges.clear(); this.commit(); this.showToast("Sommet et arcs associés supprimés."); }
  removeEdge(id) { this.remember(); this.state.edges = this.state.edges.filter((edge) => edge.id !== id); this.state.result = null; this.state.highlightEdges.clear(); this.commit(); this.showToast("Arc supprimé."); }

  bindUI() {
    document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => this.setTool(button.dataset.tool)));
    document.getElementById("solveButton").addEventListener("click", () => this.solve());
    document.getElementById("resetButton").addEventListener("click", () => { this.remember(); this.state.nodes = []; this.state.edges = []; this.state.startId = null; this.state.endId = null; this.state.nextId = 1; this.state.nextEdgeId = 1; this.state.result = null; this.state.highlightEdges.clear(); this.resetAnimation(); this.commit(); this.showToast("Le modèle a été réinitialisé."); });
    document.getElementById("arrangeButton")?.addEventListener("click", () => this.autoArrange());
    document.getElementById("fitButton").addEventListener("click", () => this.centerGraph());
    document.getElementById("pauseCalcButton")?.addEventListener("click", () => this.toggleAnimationPause());
    document.getElementById("skipCalcButton")?.addEventListener("click", () => this.finishAnimation());
    document.getElementById("undoButton").addEventListener("click", () => this.undo());
    document.getElementById("redoButton").addEventListener("click", () => this.redo());
    document.getElementById("exportButton").addEventListener("click", () => this.exportModel());
    document.getElementById("importInput").addEventListener("change", (event) => this.importModel(event));
    this.canvas.addEventListener("pointerdown", (event) => this.pointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.pointerMove(event));
    this.canvas.addEventListener("pointerup", (event) => this.pointerUp(event));
    this.canvas.addEventListener("pointerleave", () => { if (this.state.tool === "edge" && this.state.linkPreview) { this.state.linkPreview.to = this.state.linkPreview.to; this.renderer.draw(); } });
    this.canvas.addEventListener("dblclick", (event) => this.doubleClick(event));
    document.addEventListener("keydown", (event) => this.keyboard(event));
  }

  setTool(tool) { this.state.tool = tool; this.state.selectedNodeId = null; this.state.selectedEdgeId = null; this.state.linkPreview = null; document.querySelectorAll("[data-tool]").forEach((button) => button.classList.toggle("active", button.dataset.tool === tool)); const labels = { node: "Ajout de sommets", edge: "Création d’arcs", move: "Déplacement", edit: "Modification des coûts", delete: "Suppression", start: "Sélection de l’origine", end: "Sélection de la destination" }; this.setLiveStatus(labels[tool] || "Prêt à modéliser"); this.renderer.draw(); }

  pointerDown(event) { const point = this.renderer.point(event); const node = this.renderer.nodeAt(point); if (this.state.tool === "move" && node) { this.state.dragging = { id: node.id, startX: node.x, startY: node.y, moved: false }; this.canvas.setPointerCapture(event.pointerId); } else if (this.state.tool === "edge" && node) { this.state.linkPreview = { from: node.id, to: point }; this.canvas.setPointerCapture(event.pointerId); } else if (this.state.tool === "node") { this.state.dragging = { creating: true, start: point, moved: false }; } }

  pointerMove(event) { const point = this.renderer.point(event); if (this.state.dragging?.id) { const node = this.node(this.state.dragging.id); if (node) { if (!this.state.dragging.moved) { this.remember(); this.state.dragging.moved = true; } node.x = Math.max(35, Math.min(this.renderer.width - 35, point.x)); node.y = Math.max(35, Math.min(this.renderer.height - 35, point.y)); this.renderer.draw(); } } else if (this.state.linkPreview) { this.state.linkPreview.to = point; this.renderer.draw(); } else if (this.state.dragging?.creating) { this.state.dragging.moved = Math.hypot(point.x - this.state.dragging.start.x, point.y - this.state.dragging.start.y) > 8; } }

  async pointerUp(event) { const point = this.renderer.point(event); const node = this.renderer.nodeAt(point); if (this.state.dragging?.id) { if (this.state.dragging.moved) this.commit(); this.state.dragging = null; return; } if (this.state.dragging?.creating) { const creation = this.state.dragging; this.state.dragging = null; if (!creation.moved && !node && !this.renderer.edgeAt(point)) this.addNode(Math.max(35, Math.min(this.renderer.width - 35, point.x)), Math.max(35, Math.min(this.renderer.height - 35, point.y))); return; } if (this.state.linkPreview) { const from = this.state.linkPreview.from; this.state.linkPreview = null; if (node && node.id !== from) { const answer = await this.askCost(); if (answer !== null) this.addEdge(from, node.id, answer); } else this.renderer.draw(); return; } if (this.state.tool === "delete") { const edge = this.renderer.edgeAt(point); if (node) this.removeNode(node.id); else if (edge) this.removeEdge(edge.id); return; } if (this.state.tool === "start" && node) { this.remember(); this.state.startId = node.id; this.state.result = null; this.commit(); this.showToast(`Sommet ${node.id} défini comme origine.`); return; } if (this.state.tool === "end" && node) { this.remember(); this.state.endId = node.id; this.state.result = null; this.commit(); this.showToast(`Sommet ${node.id} défini comme destination.`); return; } }

  async doubleClick(event) { if (this.state.tool !== "edit") return; const edge = this.renderer.edgeAt(this.renderer.point(event)); if (!edge) return; const answer = await this.askCost(edge.weight); if (answer !== null) { this.remember(); edge.weight = answer; this.state.result = null; this.state.highlightEdges.clear(); this.commit(); this.showToast("Coût de l’arc mis à jour."); } }

  keyboard(event) { if (event.target.matches("input, textarea")) return; const keys = { n: "node", l: "edge", m: "move", e: "edit", d: "delete", s: "start", t: "end" }; if (keys[event.key.toLowerCase()]) { event.preventDefault(); this.setTool(keys[event.key.toLowerCase()]); } if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? this.redo() : this.undo(); } }

  askCost(defaultValue = 1) { return new Promise((resolve) => { const overlay = document.createElement("div"); overlay.className = "modal-overlay"; overlay.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="costTitle"><div class="eyebrow">Paramètre de l’arc</div><h2 id="costTitle">Définir le poids</h2><p>Entrez une valeur numérique. Les valeurs négatives sont autorisées sur un graphe acyclique.</p><label class="modal-label" for="costInput">Poids de l’arc</label><input id="costInput" class="modal-input" type="number" step="any" value="${defaultValue}" /><div class="modal-actions"><button class="button button-ghost" data-cancel>Annuler</button><button class="button button-primary" data-confirm>Valider le poids</button></div></div>`; document.body.appendChild(overlay); const input = overlay.querySelector("#costInput"); input.focus(); input.select(); const close = (value) => { overlay.remove(); resolve(value); }; overlay.querySelector("[data-cancel]").addEventListener("click", () => close(null)); overlay.querySelector("[data-confirm]").addEventListener("click", () => { const value = Number(input.value); if (!Number.isFinite(value)) { input.classList.add("invalid"); input.focus(); } else close(value); }); input.addEventListener("keydown", (event) => { if (event.key === "Enter") overlay.querySelector("[data-confirm]").click(); if (event.key === "Escape") close(null); }); }); }

  resetAnimation() {
    if (this.animationTimer) clearTimeout(this.animationTimer);
    this.animationTimer = null;
    this.state.animation = { active: false, paused: false, stepIndex: -1, steps: [], currentNodeId: null, currentValue: null, currentEdgeId: null, currentCandidateValue: null, evaluatedEdgeIds: new Set(), selectedEdgeIds: new Set(), completedNodeIds: new Set() };
    this.updateAnimationUI();
  }

  updateAnimationUI() {
    const progress = document.getElementById("calcProgress");
    if (!progress) return;
    const animation = this.state.animation;
    progress.classList.toggle("hidden", !animation.steps.length);
    const total = animation.steps.length;
    const current = Math.max(0, animation.stepIndex + 1);
    const stepLabel = document.getElementById("calcStepLabel");
    const stepKind = document.getElementById("calcStepKind");
    const progressBar = document.getElementById("calcProgressBar");
    const currentNode = document.getElementById("calcCurrentNode");
    const formula = document.getElementById("calcCurrentFormula");
    if (stepLabel) stepLabel.textContent = `Étape ${current} / ${total}`;
    if (stepKind) stepKind.textContent = animation.active ? (animation.paused ? "En pause" : "Propagation en cours") : total ? "Calcul terminé" : "En attente";
    if (progressBar) progressBar.style.width = `${total ? (current / total) * 100 : 0}%`;
    if (currentNode) currentNode.textContent = animation.currentNodeId ? `Sommet ${animation.currentNodeId}` : "—";
    const step = animation.steps[animation.stepIndex];
    if (formula) {
      if (!step) formula.textContent = "Prêt à démarrer";
      else if (step.kind === "initialisation") formula.textContent = "V(destination) = 0";
      else formula.textContent = `${this.mode === "min" ? "min" : "max"}(${(step.candidates || []).map((candidate) => `${candidate.weight} + V(${candidate.to}) = ${formatNumber(candidate.value)}`).join(" ; ")}) = ${formatNumber(step.value)}`;
    }
    const pauseButton = document.getElementById("pauseCalcButton");
    if (pauseButton) pauseButton.textContent = animation.paused ? "Reprendre" : "Pause";
  }

  showAnimationStep(index) {
    const animation = this.state.animation;
    const step = animation.steps[index];
    if (!step) return;
    animation.stepIndex = index;
    animation.currentNodeId = step.nodeId;
    animation.currentValue = step.value;
    const currentCandidate = (step.candidates || [])[0];
    animation.currentEdgeId = currentCandidate?.edgeId ?? null;
    animation.currentCandidateValue = currentCandidate?.value ?? null;
    animation.evaluatedEdgeIds = new Set((step.candidates || []).map((candidate) => candidate.edgeId));
    animation.selectedEdgeIds = new Set(step.selectedEdgeIds || []);
    animation.completedNodeIds = new Set(animation.steps.slice(0, index).map((item) => item.nodeId));
    this.updateAnimationUI();
    this.renderer.draw();
  }

  finishAnimation() {
    const animation = this.state.animation;
    if (this.animationTimer) clearTimeout(this.animationTimer);
    this.animationTimer = null;
    animation.active = false;
    animation.paused = false;
    animation.stepIndex = animation.steps.length - 1;
    animation.currentNodeId = null;
    animation.currentValue = null;
    animation.currentEdgeId = null;
    animation.currentCandidateValue = null;
    animation.evaluatedEdgeIds = new Set();
    animation.selectedEdgeIds = new Set(this.state.result?.optimalEdgeIds || []);
    animation.completedNodeIds = new Set(animation.steps.map((step) => step.nodeId));
    this.state.highlightEdges = new Set(this.state.result?.optimalEdgeIds || []);
    this.updateAnimationUI();
    this.setLiveStatus(this.state.result?.multiple ? "Résolution terminée · optimums multiples" : "Résolution terminée · chemin optimal");
    this.renderer.draw();
  }

  animateCalculation(result) {
    this.resetAnimation();
    const animation = this.state.animation;
    animation.steps = result.steps || [];
    animation.active = true;
    animation.paused = false;
    this.updateAnimationUI();
    let index = 0;
    const tick = () => {
      if (!animation.active) return;
      if (animation.paused) { this.animationTimer = setTimeout(tick, 120); return; }
      if (index >= animation.steps.length) { this.finishAnimation(); return; }
      this.showAnimationStep(index);
      index += 1;
      this.animationTimer = setTimeout(tick, 720);
    };
    tick();
  }

  toggleAnimationPause() {
    if (!this.state.animation.active) return;
    this.state.animation.paused = !this.state.animation.paused;
    this.setLiveStatus(this.state.animation.paused ? "Animation en pause" : "Animation en cours");
    this.updateAnimationUI();
  }

  solve() {
    const result = new BellmanKalabaSolver(this.mode).solve(this.state.nodes, this.state.edges, this.state.startId, this.state.endId);
    if (!result.ok) {
      this.state.result = null;
      this.resetAnimation();
      this.state.highlightEdges.clear();
      this.updateResult(result);
      this.showToast(result.message, "error");
      this.renderer.draw();
      return;
    }
    this.state.result = result;
    this.state.highlightEdges.clear();
    this.updateResult(result);
    this.setLiveStatus("Animation du calcul en cours");
    this.animateCalculation(result);
  }

  updateResult(result) { const empty = document.getElementById("resultEmpty"); const content = document.getElementById("resultContent"); const title = document.getElementById("resultTitle"); const badge = document.getElementById("resultBadge"); if (!result.ok) { empty.classList.remove("hidden"); content.classList.add("hidden"); title.textContent = "Calcul impossible"; badge.textContent = "À vérifier"; badge.className = "result-badge error"; return; } empty.classList.add("hidden"); content.classList.remove("hidden"); title.textContent = result.multiple ? "Plusieurs solutions optimales" : "Solution optimale identifiée"; badge.textContent = result.multiple ? "Égalité détectée" : "Calcul validé"; badge.className = `result-badge ${result.multiple ? "warning" : "success"}`; document.getElementById("resultCost").textContent = formatNumber(result.cost); document.getElementById("resultPath").textContent = result.paths[0].join(" → "); document.getElementById("resultIterations").textContent = result.iterations; document.getElementById("pathList").innerHTML = result.paths.map((path, index) => `<div class="path-row"><span>${String(index + 1).padStart(2, "0")}</span><strong>${path.join(" → ")}</strong><em>${formatNumber(result.cost)}</em></div>`).join(""); document.getElementById("valuesTable").innerHTML = [...result.values.entries()].map(([id, value]) => `<div class="value-row"><span>Sommet ${id}</span><strong>${Number.isFinite(value) ? formatNumber(value) : "∞"}</strong></div>`).join(""); }

  updateUI() { const nodeCount = this.state.nodes.length; const edgeCount = this.state.edges.length; document.getElementById("graphStats").textContent = `${nodeCount} sommet${nodeCount > 1 ? "s" : ""} · ${edgeCount} arc${edgeCount > 1 ? "s" : ""}`; document.getElementById("canvasHint").classList.toggle("hidden", nodeCount > 0); document.getElementById("startStatus").textContent = this.state.startId ? `Sommet ${this.state.startId}` : "Non définie"; document.getElementById("endStatus").textContent = this.state.endId ? `Sommet ${this.state.endId}` : "Non définie"; document.getElementById("undoButton").disabled = !this.history.length; document.getElementById("redoButton").disabled = !this.future.length; }

  setLiveStatus(text) { const indicator = document.querySelector(".live-indicator"); if (indicator) indicator.innerHTML = `<i></i> ${text}`; }
  showToast(message, type = "success") { const region = document.getElementById("toastRegion"); const toast = document.createElement("div"); toast.className = `toast ${type}`; toast.textContent = message; region.appendChild(toast); setTimeout(() => toast.remove(), 3600); }

  undo() { if (!this.history.length) return; this.future.push(this.snapshot()); this.restore(this.history.pop()); this.commit(); this.showToast("Dernière action annulée."); }
  redo() { if (!this.future.length) return; this.history.push(this.snapshot()); this.restore(this.future.pop()); this.commit(); this.showToast("Action rétablie."); }

  autoArrange() {
    if (!this.state.nodes.length) return;
    const indegree = new Map(this.state.nodes.map((node) => [node.id, 0]));
    const adjacency = new Map(this.state.nodes.map((node) => [node.id, []]));
    this.state.edges.forEach((edge) => {
      if (adjacency.has(edge.from) && adjacency.has(edge.to)) {
        adjacency.get(edge.from).push(edge.to);
        indegree.set(edge.to, indegree.get(edge.to) + 1);
      }
    });
    const queue = this.state.nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
    const topo = [];
    while (queue.length) {
      const current = queue.shift();
      topo.push(current);
      adjacency.get(current).forEach((next) => {
        indegree.set(next, indegree.get(next) - 1);
        if (indegree.get(next) === 0) queue.push(next);
      });
    }
    const levels = new Map(this.state.nodes.map((node) => [node.id, 0]));
    if (topo.length === this.state.nodes.length) {
      topo.forEach((id) => adjacency.get(id).forEach((next) => levels.set(next, Math.max(levels.get(next), levels.get(id) + 1))));
    } else {
      this.state.nodes.forEach((node, index) => levels.set(node.id, Math.floor(index / Math.max(1, Math.ceil(Math.sqrt(this.state.nodes.length))))));
      this.showToast("Cycle détecté : placement en grille effectué. Supprimez un arc du cycle pour résoudre.", "error");
    }
    const groups = new Map();
    this.state.nodes.forEach((node) => { const level = levels.get(node.id); if (!groups.has(level)) groups.set(level, []); groups.get(level).push(node); });
    const orderedLevels = [...groups.keys()].sort((a, b) => a - b);
    const marginX = 70;
    const marginY = 68;
    const xGap = orderedLevels.length > 1 ? Math.max(95, (this.renderer.width - marginX * 2) / (orderedLevels.length - 1)) : 0;
    this.remember();
    orderedLevels.forEach((level, column) => {
      const group = groups.get(level);
      const yGap = group.length > 1 ? Math.min(125, (this.renderer.height - marginY * 2) / (group.length - 1)) : 0;
      const totalHeight = yGap * (group.length - 1);
      group.sort((a, b) => a.id - b.id).forEach((node, row) => {
        node.x = Math.max(38, Math.min(this.renderer.width - 38, marginX + column * xGap));
        node.y = Math.max(38, Math.min(this.renderer.height - 55, (this.renderer.height - totalHeight) / 2 + row * yGap));
      });
    });
    this.commit();
    if (topo.length === this.state.nodes.length) this.showToast("Sommets organisés automatiquement par niveaux.");
  }

  centerGraph() {
    this.autoArrange();
  }

  loadExample(kind) {
    const isMulti = kind === "multi";
    const isComplex = kind === "complex";
    const isMax = kind === "max";
    const positions = isComplex
      ? Array.from({ length: 18 }, (_, index) => [90 + (index % 6) * 130, 100 + Math.floor(index / 6) * 145])
      : isMulti
        ? [[90, 190], [250, 90], [430, 90], [250, 290], [430, 290], [650, 190]]
        : [[80, 190], [205, 90], [205, 290], [340, 190], [475, 90], [475, 290], [610, 190], [745, 90], [745, 290], [870, 190]];
    const edges = isComplex
      ? [
        [1, 2, 5], [1, 3, 4], [1, 4, 6],
        [2, 5, 4], [2, 6, 3], [2, 7, 8], [3, 5, 5], [3, 6, 2], [3, 8, 5], [4, 6, 3], [4, 7, 4], [4, 8, 1],
        [5, 9, 4], [5, 10, 6], [6, 9, 5], [6, 10, 3], [6, 11, 4], [7, 10, 2], [7, 11, 5], [7, 12, 3], [8, 11, 6], [8, 12, 2],
        [9, 13, 4], [9, 14, 7], [10, 13, 2], [10, 14, 4], [10, 15, 6], [11, 14, 3], [11, 15, 2], [12, 14, 5], [12, 15, 4],
        [13, 16, 3], [13, 17, 5], [14, 16, 4], [14, 17, 2], [15, 16, 6], [15, 17, 3], [16, 18, 5], [17, 18, 7]
      ]
      : isMulti
        ? [[1, 2, 5], [2, 3, 5], [3, 6, 5], [1, 4, 5], [4, 5, 5], [5, 6, 5], [2, 5, 8], [4, 3, 8]]
        : [[1, 2, 4], [1, 3, 2], [2, 4, 5], [3, 4, 3], [2, 5, 7], [4, 6, 4], [5, 6, 2], [4, 7, 6], [6, 7, 3], [6, 8, 5], [7, 9, 4], [8, 10, 4], [9, 10, 3]];
    this.state.nodes = positions.map((position, index) => new GraphNode(index + 1, position[0], position[1]));
    this.state.edges = edges.map((edge, index) => new GraphEdge(index + 1, edge[0], edge[1], isMax && !isMulti ? edge[2] + (index % 3) : edge[2]));
    this.state.startId = 1;
    this.state.endId = isComplex ? 18 : isMulti ? 6 : 10;
    this.state.nextId = this.state.nodes.length + 1;
    this.state.nextEdgeId = this.state.edges.length + 1;
    this.state.result = null;
    this.state.highlightEdges.clear();
    this.resetAnimation();
    this.commit();
    setTimeout(() => this.autoArrange(), 120);
  }

  exportModel() { const payload = { application: "OptiGraph Lab", version: 2, mode: this.mode, exportedAt: new Date().toISOString(), nodes: this.state.nodes, edges: this.state.edges, startId: this.state.startId, endId: this.state.endId }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `optigraph-${this.mode}-${Date.now()}.json`; link.click(); URL.revokeObjectURL(url); this.showToast("Modèle exporté au format JSON."); }

  importModel(event) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const payload = JSON.parse(reader.result); if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) throw new Error(); this.remember(); this.state.nodes = payload.nodes.map((node) => new GraphNode(Number(node.id), Number(node.x), Number(node.y))); this.state.edges = payload.edges.map((edge, index) => new GraphEdge(Number(edge.id) || index + 1, Number(edge.from), Number(edge.to), Number(edge.weight))); this.state.startId = payload.startId ?? null; this.state.endId = payload.endId ?? null; this.state.nextId = Math.max(0, ...this.state.nodes.map((node) => node.id)) + 1; this.state.nextEdgeId = Math.max(0, ...this.state.edges.map((edge) => edge.id)) + 1; this.state.result = null; this.state.highlightEdges.clear(); this.commit(); this.showToast("Modèle importé avec succès."); } catch { this.showToast("Le fichier ne respecte pas le format OptiGraph JSON.", "error"); } event.target.value = ""; }; reader.readAsText(file); }

  loadSavedModel() { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) this.restore(saved); } catch { /* stockage indisponible : le modèle reste local */ } }
}

function formatNumber(value) { return Number.isInteger(value) ? String(value) : Number(value).toFixed(2).replace(/\.00$/, ""); }

if (typeof window !== "undefined") window.addEventListener("DOMContentLoaded", () => new OptiGraphApp());

export { GraphNode, GraphEdge, BellmanKalabaSolver };
