// Bellman-Kalaba Algorithm - Unified Implementation
// Supports both minimization and maximization

function BellmanKalabaAlgorithm(options) {
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

BellmanKalabaAlgorithm.prototype = {
    ajouterLien: function (lien) {
        this.liens.push(lien);
    },

    supprimerLien: function (lien) {
        var index = this.liens.indexOf(lien);
        if (index >= 0) {
            this.liens.splice(index, 1);
            return true;
        }
        return false;
    },

    supprimerSommet: function (sommet) {
        var index = this.sommets.indexOf(sommet);
        if (index >= 0) {
            var liens = this.getPrecedents(sommet).concat(this.getSuivants(sommet));
            for (var lien of liens)
                this.liens.splice(this.liens.indexOf(lien), 1);
            this.sommets.splice(index, 1);
            return liens;
        }
        return null;
    },

    getPrecedents: function (sommet) {
        return this.liens.filter(function (lien) {
            return lien.suivant === sommet;
        });
    },

    getSuivants: function (sommet) {
        return this.liens.filter(function (lien) {
            return lien.precedent === sommet;
        });
    },

    ajouterSommet: function () {
        var sommet = new Sommet(this.lastIndex, Infinity);
        this.sommets.push(sommet);
        this.lastIndex++;
        return sommet;
    },

    initialiserCoutsTotaux: function () {
        for (var sommet of this.sommets)
            sommet.coutTotal = this.infinity;
    },

    getSommetByIndex: function (index) {
        return this.sommets.find(function (sommet) {
            return sommet.index === index;
        });
    },

    setDebut: function (index) {
        if (index != null) {
            this.debut = this.getSommetByIndex(index.index);
            this.resetColor();
        }
        return this.debut;
    },

    setFin: function (index) {
        if (index != null) {
            this.fin = this.getSommetByIndex(index.index);
            this.resetColor();
        }
        return this.fin;
    },

    main: function () {
        this.initialiserCoutsTotaux();

        // Réinitialiser les marqueurs de chemin optimal
        for (var lien of this.liens) {
            lien.isOptimal = false;
        }

        if (this.debut != null && this.fin != null) {
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
                alert(notification);
            }, this.animationDelay * this.traces.length);

            return true;
        } else {
            return false;
        }
    },

    traiter: function (l_aTraiter) {
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
                        if (eval((aTraiter.coutTotal + lien.cout) + this.compare + precedent.coutTotal)) {
                            precedent.coutTotal = aTraiter.coutTotal + lien.cout;
                            precedent.suivant = aTraiter;
                            this.ajouterTrace(precedent, precedent.coutTotal, lien);
                            if (precedent != this.debut)
                                l.push(precedent);
                            else
                                this.solution = true;
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
    },

    copyArray: function (i, o) {
        Array.prototype.push.apply(o, i);
        return o;
    },

    clearArray: function (a) {
        a.length = 0;
        return a;
    },

    getInfiniteLoop: function (actual, toFind) {
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
    },

    getTitle: function () {
        var text = this.isMin ? "Minimisation" : "Maximisation";
        return text;
    },

    setIsMin: function (isMin) {
        this.isMin = isMin;
        this.infinity = isMin ? Infinity : -Infinity;
        this.compare = isMin ? ">" : "<";
        this.cheminType = isMin ? "minimal" : "maximal";
    },

    setView: function (view) {
        this.view = view;
    },

    resetColor: function () {
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
    },

    colorResult: function () {
        if (this.solution === true) {
            this.initialiserCoutsTotaux();
            this.animationCout(0);
        } else {
            alert("Aucune solution possible trouvée");
        }
    },

    ajouterTrace: function (sommet, cout, lien) {
        this.traces.push({
            sommet: sommet,
            cout: cout,
            lien: lien
        });
    },

    getTraces: function () {
        this.traces.sort(function (a, b) {
            return a.niveau > b.niveau;
        });

        return this.traces;
    },

    animationColor: function (s) {
        if (s != null && s.suivant != null) {
            // Colorer le sommet en jaune
            s.color = {
                r: 255,
                g: 170,
                b: 1
            };

            // Trouver et marquer l'arête vers le sommet suivant
            var liensVersSuivant = this.getSuivants(s);
            for (var lien of liensVersSuivant) {
                if (lien.suivant === s.suivant) {
                    lien.isOptimal = true;
                    break;
                }
            }

            this.view.refresh();
            var ts = this;
            setTimeout(() => {
                ts.animationColor(s.suivant);
            }, this.animationDelay);
        } else if (s != null) {
            // Dernier sommet
            s.color = {
                r: 255,
                g: 170,
                b: 1
            };
            this.view.refresh();
        }
    },

    animationCout: function (i) {
        if (i < this.traces.length) {
            this.traces[i].sommet.coutTotal = this.traces[i].cout;
            if (this.traces[i].lien != null)
                this.traces[i].lien.actualtrace = true;
            this.view.refresh();
            if (this.traces[i].lien != null)
                this.traces[i].lien.actualtrace = false;
            var ts = this;
            setTimeout(() => {
                ts.animationCout(i + 1);
            }, this.animationDelay);
        } else {
            this.animationColor(this.debut);
        }
    },

    getCheminMinimal: function () {
        var chemin = [];
        var sommet = this.debut;
        while (sommet != null) {
            chemin.push(sommet);
            sommet = sommet.suivant;
        }
        return chemin;
    }
};

// Backward compatibility: create alias for old class name
var ConteneurLiens = BellmanKalabaAlgorithm;
