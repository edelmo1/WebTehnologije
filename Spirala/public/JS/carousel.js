function postaviCarousel(glavniElement, sviUpiti, indeks = 0, nekretninaId = null) {
    if (!glavniElement || !Array.isArray(sviUpiti) || sviUpiti.length === 0 || indeks < 0 || indeks >= sviUpiti.length) {
        return null;
    }

    let trenutnaStranica = 1;
    let kraj = false;

    /*
    function azurirajPrikaz() {
        const upit = sviUpiti[indeks];
        glavniElement.innerHTML = `
            <div class="upit">
                <p class="upit-korisnik">Korisnik: ${upit.korisnik_id || 'Nepoznato'}</p>
                <p class="upit-tekst">${upit.tekst_upita || 'Tekst nije dostupan'}</p>
            </div>
        `;
    }*/
   function azurirajPrikaz(index){
    if(index>=0 && index<sviUpiti.length){
        const upit=sviUpiti[index];
        const upitiHTML=`<p class="upit-korisnik">Korisnik: ${upit.korisnik_id || 'Nepoznato'}</p>
        <p class="upit-tekst">${upit.tekst_upita || 'Tekst nije dostupan'}</p>`;
        glavniElement.innerHTML=upitiHTML;
    }
   }

    function fnLijevo() {
        indeks = (indeks - 1 + sviUpiti.length) % sviUpiti.length;
        azurirajPrikaz(indeks);
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviUpiti.length;
        azurirajPrikaz(indeks);

        // Provjera da li treba učitati nove upite
        console.log(sviUpiti);
if(indeks>=sviUpiti.length-1){
    if(!kraj){
        PoziviAjax.getNextUpiti(nekretninaId,trenutnaStranica,function(error,nextUpiti){
            if(error){
                console.error("Greška prilikom dohvatanja sljedeće stranice: " , error);
                kraj=true;
                indeks=0;
                azurirajPrikaz(indeks);
            }
            else if(nextUpiti.length===0){
                kraj=true;
                console.log("Nema više upita za učitavanje!");
                indeks=0;
                azurirajPrikaz(indeks);
            }
            else{
                sviUpiti=sviUpiti.concat(nextUpiti);
                trenutnaStranica++;
                indeks++;
                azurirajPrikaz(indeks);
            }
        });
    }
    else{
        indeks=0;
        azurirajPrikaz(indeks);
    }
}
else{
    indeks++;
    azurirajPrikaz(indeks);
}

    //azurirajPrikaz();
}
return { fnLijevo, fnDesno };

}
