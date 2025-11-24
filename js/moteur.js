function Moteur(nb_sommet, is_min){
	var init_sommet = is_min ? Infinity : -Infinity;
	this.n = nb_sommet;
	this.liste_sommet = new Array();
	for (var i = 0; i < n; i++) {
		this.liste_sommet.push(new Sommet(i+1,init_sommet));
	}
	this.liste_sommet[n-1].coutTotal = 0;
}