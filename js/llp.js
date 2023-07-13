function wait(t){
    var d1 = new Date().getTime();
    var i = 0;
    while((new Date().getTime())-d1 < t)i++;
    //document.getElementById("solus").innerHTML += i;            
}
