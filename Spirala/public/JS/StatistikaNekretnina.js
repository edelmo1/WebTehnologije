let StatistikaNekretnina = function() {
    let spisak; 

    let init = function(listaNekretnina, listaKorisnika) {
        spisak = SpisakNekretnina(); 
        spisak.init(listaNekretnina, listaKorisnika); 
    }





let prosjecnaKvadratura = function (kriterij){
   let filtriranaLista= spisak.filtrirajNekretnine(kriterij);  //Dobijamo listu filtriranih nekretnina
   let suma=0; //trazimo prosjek
   for(let i=0;i<filtriranaLista.length;i++){
   suma+= filtriranaLista[i].kvadratura;
   }
   return suma/filtriranaLista.length;
}





let outlier = function(kriterij,nazivSvojstva){   //Naziv svojstva može biti id,kvadratura,cijena,godina_izgradnje

    let filtriranaLista=spisak.filtrirajNekretnine(kriterij);
    if(filtriranaLista.length==0){
        return null;
    }
    let suma=0;
    /*for(let i=0;i<filtriranaLista.length;i++){
        if(typeof filtriranaLista[i][nazivSvojstva]!=="number"){       //posto je receno da se srednja vrijednost racuna iz "bas svih nekretnina,ne filtriranih",tj. a 
            return null;                                               //ne iz onih sa navedenim svojstvom(filtriranaLista)
        }
        suma+=filtriranaLista[i][nazivSvojstva];
    }*/
   for(let i=0;i<spisak.listaNekretnina.length;i++){
    if(typeof spisak.listaNekretnina[i][nazivSvojstva]!=="number"){
        return null;
    }
    suma+=spisak.listaNekretnina[i][nazivSvojstva];
   }
    let prosjek = suma/spisak.listaNekretnina.length;

    let max = -Infinity;
    let outlier =null;
    for(let i=0;i<filtriranaLista.length;i++){
        let razlika = Math.abs(filtriranaLista[i][nazivSvojstva]-prosjek);
        if(razlika>max){
            max=razlika;
            outlier=filtriranaLista[i];
        }
    }
    console.log("Rezultat: " + outlier);
    return outlier;
}






let mojeNekretnine = function  (korisnik) {

    // Filtriranje nekretnina u kojima je korisnik postavio bar jedan upit
    const nekretnineSaUpitima = spisak.listaNekretnina.filter(nekretnina => {
        return nekretnina.upiti.some(upit => upit.korisnik_id === korisnik.id);
    });
    // Brojanje upita za svaku nekretninu
    nekretnineSaUpitima.forEach(nekretnina => {
        nekretnina.brojUpita = nekretnina.upiti.filter(upit => upit.korisnik_id === korisnik.id).length;      //posto iz teksta spirale nije najjasnije prema kojem kriteriju se radi sortiranje ja sam uradio na ovaj nacin
    });

    nekretnineSaUpitima.sort((a, b) => b.brojUpita - a.brojUpita);

    return nekretnineSaUpitima;
}







let histogramCijena = function (periodi, rasponiCijena) {
    let histogram = [];


    console.log("Rasponi perioda u his:" ,periodi);
    console.log("Rasponi cijena u histogramu su: " , rasponiCijena);
    periodi.forEach((period, indeksPerioda) => {
        let nekretnineZaPeriod = spisak.listaNekretnina.filter(nekretnina => {
            let godinaObjave = parseInt(nekretnina.datum_objave.split(".")[2].trim()); 
            return godinaObjave >= period.od && godinaObjave <= period.do;
        });

        // Prolaz kroz svaki raspon cijena
        rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
            let nekretnineZaRaspon = nekretnineZaPeriod.filter(nekretnina => {
                return nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do;
            });

            histogram.push({
                indeksPerioda: indeksPerioda,
                indeksRasporedaCijena: indeksRasponaCijena,
                brojNekretnina: nekretnineZaRaspon.length
            });
        });
    });

    return histogram;
};


    return {

        init:init,
        prosjecnaKvadratura:prosjecnaKvadratura,
        outlier:outlier,
        mojeNekretnine:mojeNekretnine,
        histogramCijena:histogramCijena
    }
}


