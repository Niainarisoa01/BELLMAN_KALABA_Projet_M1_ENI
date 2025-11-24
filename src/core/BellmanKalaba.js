import { Sommet } from '../models/Node.js';

export class BellmanKalabaAlgorithm {
    constructor(options) {
        options = options || {};

        this.liens = [];
        this.sommets = [];
        this.debut = null;
        this.fin = null;
        this.visited = [];
        this.solution = false;
        this.infinite = false;
        this.infiniteList = [];
        this.traces = [];
        this.lastIndex = 1;
        this.view = null;
        this.animationDelay = options.animationDelay || 500;

        // Configuration based on optimization type
        this.isMin = options.isMin !== undefined ? options.isMin : true;
        this.setIsMin(this.isMin);
    }

    ajouterLien(lien) {
        this.liens.push(lien);
    }

    supprimerLien(lien) {
        var index = this.liens.indexOf(lien);
        if (index >= 0) {
            this.liens.splice(index, 1);
            return true;
        }
        return false;
    }

    supprimerSommet(sommet) {
        var index = this.sommets.indexOf(sommet);
        if (index >= 0) {
            var liens = this.getPrecedents(sommet).concat(this.getSuivants(sommet));
            for (var lien of liens)
                this.liens.splice(this.liens.indexOf(lien), 1);
            this.sommets.splice(index, 1);
            return liens;
        }
        return null;
    }

    getPrecedents(sommet) {
        return this.liens.filter(function (lien) {
            return lien.suivant === sommet;
        });
    }

    getSuivants(sommet) {
        return this.liens.filter(function (lien) {
            return lien.precedent === sommet;
        });
    }

    ajouterSommet() {
        var sommet = new Sommet(this.lastIndex, Infinity);
        this.sommets.push(sommet);
        this.lastIndex++;
        return sommet;
    }

    initialiserCoutsTotaux() {
        for (var sommet of this.sommets)
            sommet.coutTotal = this.infinity;
    }

    getSommetByIndex(index) {
        return this.sommets.find(function (sommet) {
            return sommet.index === index;
        });
    }

    setDebut(index) {
        if (index != null) {
            this.debut = this.getSommetByIndex(index.index);
            this.resetColor();
        }
        return this.debut;
    }

    setFin(index) {
        if (index != null) {
            this.fin = this.getSommetByIndex(index.index);
            this.resetColor();
        }
        return this.fin;
    }

    main() {
        this.initialiserCoutsTotaux();

        // Réinitialiser les marqueurs de chemin optimal
        for (var lien of this.liens) {
            lien.isOptimal = false;
        }

        // Validation des entrées
        if (this.debut == null || this.fin == null) {
            alert("Veuillez sélectionner un sommet de début et un sommet de fin");
            return false;
        }

        // Initialiser le sommet de fin (backward DP)
        this.fin.coutTotal = 0;
        this.ajouterTrace(this.fin, 0);
        var l = [this.fin];
        this.traiter(l);
        this.colorResult();

        var ts = this;
        setTimeout(function () {
            // Display optimal path notification
            var cheminOptimal = ts.getCheminMinimal();
            var notification = "Chemin " + ts.cheminType + " : ";
            for (var i = cheminOptimal.length - 1; i >= 0; i--) {
                notification += cheminOptimal[i].index;
                if (i > 0) {
                    notification += " -> ";
                }
            }
            notification += " (Coût total : " + ts.debut.coutTotal + ")";

            // Check for branching at the start or anywhere (simplified check)
            if (ts.debut.suivants && ts.debut.suivants.length > 1) {
                notification += "\n\nNote: Plusieurs chemins critiques ont été détectés et sont visualisés en jaune.";
            }

            alert(notification);
        }, this.animationDelay * this.traces.length);

        return true;
    }

    traiter(l_aTraiter) {
        var _l = l_aTraiter;
        var l = [];
        var trouve = false;
        while (_l.length > 0) {
            for (var e of _l) {
                var l_p = this.getPrecedents(e);
                for (var lien of l_p) {
                    if (!this.getInfiniteLoop(e, lien.precedent)) {
                        var precedent = lien.precedent;
                        var aTraiter = e;
                        var nouveauCout = aTraiter.coutTotal + lien.cout;

                        // Comparaison explicite selon minimisation ou maximisation
                        var amelioration = this.isMin
                            ? nouveauCout < precedent.coutTotal
                            : nouveauCout > precedent.coutTotal;

                        var egalite = (nouveauCout === precedent.coutTotal) && (precedent.coutTotal !== this.infinity);

                        if (amelioration) {
                            precedent.coutTotal = nouveauCout;
                            precedent.suivants = [aTraiter]; // Nouveau meilleur chemin
                            precedent.suivant = aTraiter;    // Rétro-compatibilité
                            this.ajouterTrace(precedent, precedent.coutTotal, lien);
                            if (precedent != this.debut)
                                l.push(precedent);
                            else
                                this.solution = true;
                        } else if (egalite) {
                            // Chemin alternatif de même coût
                            if (!precedent.suivants) precedent.suivants = [];
                            // Éviter les doublons
                            var exists = precedent.suivants.some(function (s) { return s.index === aTraiter.index; });
                            if (!exists) {
                                precedent.suivants.push(aTraiter);
                            }
                        }
                    } else {
                        this.infinite = true;
                    }
                }
            }
            this.clearArray(_l);
            this.copyArray(l, _l);
            this.clearArray(l);
        }
    }

    copyArray(i, o) {
        Array.prototype.push.apply(o, i);
        return o;
    }

    clearArray(a) {
        a.length = 0;
        return a;
    }

    getInfiniteLoop(actual, toFind) {
        var a = actual;
        var t = false;
        var l = [];
        while (t === false && a != null) {
            if (a.index === toFind.index)
                t = true;
            l.push(a);
            a = a.suivant;
        }
        if (t === true) {
            this.infiniteList.push(l);
        }
        return t;
    }

    getTitle() {
        var text = this.isMin ? "Minimisation" : "Maximisation";
        return text;
    }

    setIsMin(isMin) {
        this.isMin = isMin;
        this.infinity = isMin ? Infinity : -Infinity;
        this.compare = isMin ? "<" : ">";
        this.cheminType = isMin ? "minimal" : "maximal";
    }

    setView(view) {
        this.view = view;
    }

    resetColor() {
        for (var s of this.sommets) {
            s.color = { r: 34, g: 48, b: 60 };
        }
        if (this.debut != null) {
            this.debut.color = {
                r: 50,
                g: 85,
                b: 127
            };
        }

        if (this.fin != null) {
            this.fin.color = {
                r: 190,
                g: 20,
                b: 16
            };
        }
    }

    colorResult() {
        if (this.solution === true) {
            this.initialiserCoutsTotaux();
            this.animationCout(0);
        } else {
            alert("Aucune solution possible trouvée");
        }
    }

    ajouterTrace(sommet, cout, lien) {
        this.traces.push({
            sommet: sommet,
            cout: cout,
            lien: lien
        });
    }

    getTraces() {
        this.traces.sort(function (a, b) {
            return a.niveau > b.niveau;
        });

        return this.traces;
    }

    animationColor(s) {
        if (s != null) {
            // Colorer le sommet en jaune
            s.color = {
                r: 255,
                g: 170,
                b: 1
            };

            // Gérer les successeurs (chemins multiples)
            var successors = s.suivants || (s.suivant ? [s.suivant] : []);

            if (successors.length > 0) {
                var liensVersSuivant = this.getSuivants(s);

                // Pour chaque successeur (branche du chemin optimal)
                for (var i = 0; i < successors.length; i++) {
                    var nextNode = successors[i];

                    // Marquer l'arête correspondante
                    for (var lien of liensVersSuivant) {
                        if (lien.suivant === nextNode) {
                            lien.isOptimal = true;
                            break;
                        }
                    }

                    // Continuer l'animation récursivement
                    // Utiliser une closure pour capturer nextNode
                    (function (ts, node) {
                        setTimeout(function () {
                            ts.animationColor(node);
                        }, ts.animationDelay);
                    })(this, nextNode);
                }
            }

            if (this.view) this.view.refresh();
        }
    }

    animationCout(i) {
        if (i < this.traces.length) {
            this.traces[i].sommet.coutTotal = this.traces[i].cout;
            if (this.traces[i].lien != null)
                this.traces[i].lien.actualtrace = true;
            if (this.view) this.view.refresh();
            if (this.traces[i].lien != null)
                this.traces[i].lien.actualtrace = false;
            var ts = this;
            setTimeout(() => {
                ts.animationCout(i + 1);
            }, this.animationDelay);
        } else {
            this.animationColor(this.debut);
        }
    }

    getCheminMinimal() {
        var chemin = [];
        var sommet = this.debut;
        while (sommet != null) {
            chemin.push(sommet);
            sommet = sommet.suivant;
        }
        return chemin;
    }

    centerGraph(canvasWidth, canvasHeight) {
        if (this.sommets.length === 0) return;

        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        // Calculate bounding box
        for (var s of this.sommets) {
            if (s.position.x < minX) minX = s.position.x;
            if (s.position.x > maxX) maxX = s.position.x;
            if (s.position.y < minY) minY = s.position.y;
            if (s.position.y > maxY) maxY = s.position.y;
        }

        var graphWidth = maxX - minX;
        var graphHeight = maxY - minY;

        var centerX = minX + graphWidth / 2;
        var centerY = minY + graphHeight / 2;

        var targetX = canvasWidth / 2;
        var targetY = canvasHeight / 2;

        var offsetX = targetX - centerX;
        var offsetY = targetY - centerY;

        // Apply offset
        for (var s of this.sommets) {
            s.position.x += offsetX;
            s.position.y += offsetY;
        }

        if (this.view) this.view.refresh();
    }
}
