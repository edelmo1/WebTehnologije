let trenutnaNekretnina = null;
let isAdmin = false;
let currentUserId = null;

let nizInteresovanja = [];
let trenutniIndeks = 0;
let trenutnaStranica = 1;
let kraj = false;


function ucitajDetaljeNekretnine(nekretninaId) {

    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err) {
            console.error('Error getting user:', err);
            return;
        }
        currentUserId = korisnik.id;
        isAdmin = korisnik.admin;
    });


    PoziviAjax.getNekretnina(nekretninaId, function(error, nekretnina) {
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        trenutnaNekretnina = nekretnina;

        const imgPrefix = nekretnina.tip_nekretnine == "Stan" ? "stan" : "Kuca";
        document.getElementById('slika-nekretnine').src = `../HTML/slike/${imgPrefix}${nekretnina.id}.jpg`;
        

        document.getElementById('naziv').textContent = nekretnina.naziv;
        document.getElementById('kvadratura').textContent = `Kvadratura: ${nekretnina.kvadratura} m²`;
        document.getElementById('cijena').textContent = `Cijena: ${nekretnina.cijena} KM`;
        document.getElementById('grijanje').textContent = `Grijanje: ${nekretnina.tip_grijanja}`;
        
        // klikabilna lokacija
        const lokacijaElement = document.getElementById('lokacija');
        const lokacijaLink = document.createElement('a');
        lokacijaLink.href = '#';
        lokacijaLink.textContent = `Lokacija: ${nekretnina.lokacija}`;
        lokacijaLink.onclick = (e) => {
            e.preventDefault();
            ucitajTop5Nekretnina(nekretnina.lokacija);
        };
        lokacijaElement.innerHTML = '';
        lokacijaElement.appendChild(lokacijaLink);

        document.getElementById('godina').textContent = `Godina izgradnje: ${nekretnina.godina_izgradnje}`;
        document.getElementById('datum').textContent = `Datum objave: ${nekretnina.datum_objave}`;
        document.getElementById('opis').querySelector('p').textContent = nekretnina.opis;

        // Ucitaj interesovanja
        PoziviAjax.getNekretninaInteresovanja(nekretnina.id, function(error, interesovanja) {
            if (error) {
                console.error('Greška prilikom učitavanja interesovanja:', error);
                return;
            }
            nizInteresovanja = interesovanja;
            console.log("INTERESOVANJA!!:",nizInteresovanja);

            prikaziInteresovanje(trenutniIndeks);
        });
    });
}














function prikaziInteresovanje(index) {


    const interesovanje = nizInteresovanja[index];

  console.log("INTERES: ",interesovanje);

    //Treba za zahtjeve da vidimo da li cemo ih prikazivati
    const isUserAuthorized = isAdmin || //Ako je admin
    interesovanje.KorisnikId === currentUserId ;  //Ako je loginovan, odnosno ako je vlasnik zahtjeva
    //|| interesovanje.vezaniZahtjevi?.some(z => z.KorisnikId === currentUserId);


    if (index >= 0 && index < nizInteresovanja.length) {
            
        const container = document.getElementById('upiti');

        let html = `<div class="interesovanje">
            <p class="id">ID: ${interesovanje.id}</p>
            <p class="korisnik">Korisnik: ${interesovanje.KorisnikId}</p>
            <p class="tekst">Tekst: ${interesovanje.tekst}</p>`;

        if ('odbijenaPonuda' in interesovanje) {
            // Ovo je ponuda
            html += `<p class="status">Status: ${interesovanje.odbijenaPonuda ? 'odbijena' : 'odobrena'}</p>`;
            if(interesovanje.cijenaPonude!=null) 
                html += `<p class="cijena">Cijena: ${interesovanje.cijenaPonude}</p>`;
        } 
   
        
        else if ('odobren' in interesovanje ) {
            // Ovo je zahtjev

            html += `<p class="datum">Traženi datum: ${interesovanje.trazeniDatum}</p>
                     <p class="status">Status: ${interesovanje.odobren ? 'odobren' : 'nije odobren'}</p>`;

                // Ako je korisnik admin ili ima prava, prikazujemo sve dodatne kolone
                html += `<p class="odgovor-datum">Datum odgovora: ${interesovanje.datumOdgovora || 'N/A'}</p>`;
                html += `<p class="odgovor-tekst">Odgovor: ${interesovanje.tekstOdgovora || 'N/A'}</p>`;
                html += `<p class="napomena">Napomena: ${interesovanje.napomena || 'Nema napomene'}</p>`;
        

                if(!isUserAuthorized)
                {
                    html = `<div class="interesovanje">
                    <p class="id">Nemate ovlaštenja da vidite zahtjev!</p>`
                }
        } 

        html += '</div>';
        container.innerHTML = html;
    
    }
}








function initInteresovanjeForm() {
    const tipSelect = document.getElementById('tipInteresovanja');
    const form = document.getElementById('interesovanjeForm');
    
    tipSelect.onchange = handleTipInteresovanjaChange;
    form.onsubmit = handleInteresovanjeSubmit;

    PoziviAjax.getKorisnik((err, korisnik) => {
        if (err) {
            console.error('Error getting user:', err);
            return;
        }
        currentUserId = korisnik.id;
        isAdmin = korisnik.admin;
    });
}








function handleTipInteresovanjaChange(e) {
    const zahtjevFields = document.getElementById('zahtjevFields');
    const ponudaFields = document.getElementById('ponudaFields');
    
    zahtjevFields.style.display = 'none';
    ponudaFields.style.display = 'none';
    
    if (e.target.value === 'zahtjev') {
        zahtjevFields.style.display = 'block';
    } else if (e.target.value === 'ponuda') {
        ponudaFields.style.display = 'block';
        ucitajPonudeZaDropdown();
    }
}









function ucitajPonudeZaDropdown() {
    const select = document.getElementById('vezanaPonuda');
    select.innerHTML = '<option value="">Odaberite ponudu</option>';
    const ponude = nizInteresovanja.filter(i => 'odbijenaPonuda' in i);

    // Pronađi sve ponude koje je korisnik kreirao

    const korisnikovePonude = ponude.filter(p => p.KorisnikId === currentUserId);
    // Funkcija za rekurzivno pronalaženje svih vezanih ponuda
    function findAllLinkedOffers(startPonuda) {
        let linkedOffers = new Set([startPonuda]);
        let currentPonuda = startPonuda;

        while (currentPonuda.vezanaPonudaId) {
            const linkedPonude = ponude.filter(p => p.id === currentPonuda.vezanaPonudaId);
            
            if (linkedPonude.length > 0) {
                linkedPonude.forEach(p => linkedOffers.add(p));
                currentPonuda = linkedPonude[0];
            } else {
                break;
            }
        }

        return Array.from(linkedOffers);
    }

    // Pronađi sve vezane ponude za korisnikove ponude
    let povezaniIdjevi = new Set();
    korisnikovePonude.forEach(kPonuda => {
        const linkedOffers = findAllLinkedOffers(kPonuda);
        linkedOffers.forEach(ponuda => {
            povezaniIdjevi.add(ponuda.id);
        });
    });

    // Dodaj sve ponude koje su vezane za korisnikove ponude
    ponude.forEach(ponuda => {
        if (ponuda.vezanaPonudaId && povezaniIdjevi.has(ponuda.vezanaPonudaId)) {
            povezaniIdjevi.add(ponuda.id);
        }
    });

    // Prikaži dostupne ponude
    const dostupnePonude = isAdmin ? ponude : ponude.filter(p => povezaniIdjevi.has(p.id) || p.KorisnikId === currentUserId);

    if (dostupnePonude.length === 0) {
        select.disabled = true;
        return;
    }
    select.disabled = false;
    let postoji=false;
    dostupnePonude.forEach(ponuda => {
        if (!jesuLiPonudeZakljucane(ponuda, ponude)) {
            postoji=true;
            const option = document.createElement('option');
            option.value = ponuda.id;
            option.textContent = `Ponuda ${ponuda.id}: ${ponuda.tekst}`;
            select.appendChild(option);
        }
        if(postoji==false)
            select.disabled = true;

    });
}








function handleInteresovanjeSubmit(e) {
    e.preventDefault();
    
    const tip = document.getElementById('tipInteresovanja').value;
    const tekst = document.getElementById('tekstInteresovanja').value;
    
    let data = { tekst };
    data.idVezanePonude=document.getElementById('vezanaPonuda').value;
    if (tip === 'zahtjev') {
        data.trazeniDatum = document.getElementById('trazeniDatum').value;
        PoziviAjax.postZahtjev(trenutnaNekretnina.id, data, handleResponse);
    } else if (tip === 'ponuda') {
        data.cijena = document.getElementById('cijenaPonude').value;
        data.idVezanePonude = document.getElementById('vezanaPonuda').value;
        PoziviAjax.postPonuda(trenutnaNekretnina.id, data.tekst,data.cijena,new Date(),data.idVezanePonude,null, handleResponse);
    } else {
        PoziviAjax.postUpit(trenutnaNekretnina.id, data.tekst, handleResponse);
    }
}








function handleResponse(response) {

    if (response !=null && response.error) {
        alert(response.error);
        return;
    }
    
    PoziviAjax.getNekretninaInteresovanja(trenutnaNekretnina.id, function(error, interesovanja) {
        if (error) {
            console.error('Greška prilikom učitavanja interesovanja:', error);
            return;
        }
        nizInteresovanja = interesovanja;
        prikaziInteresovanje(trenutniIndeks);
    });


    prikaziInteresovanje(trenutniIndeks);
    document.getElementById('interesovanjeForm').reset();
}








function jesuLiPonudeZakljucane(ponuda, svePonude) {
    const lanacPonuda = nadjiLanacPonuda(nadjiKorijenskuPonudu(ponuda, svePonude), svePonude);
    return lanacPonuda.some(p => p.odbijenaPonuda);
}





function nadjiKorijenskuPonudu(ponuda, svePonude) {
    if (!ponuda.vezanaPonudaId) return ponuda;
    const roditeljska = svePonude.find(p => p.id === ponuda.vezanaPonudaId);
    return roditeljska ? nadjiKorijenskuPonudu(roditeljska, svePonude) : ponuda;
}




function nadjiLanacPonuda(ponuda, svePonude) {
    const lanac = [ponuda];
    svePonude.filter(p => p.vezanaPonudaId === ponuda.id)
             .forEach(dijete => lanac.push(...nadjiLanacPonuda(dijete, svePonude)));
             console.log("Lanac za ",ponuda , " je: ",lanac);

    return lanac;
}




















// Prikazivanje top 5 nekretnina
function ucitajTop5Nekretnina(lokacija) {
    PoziviAjax.getTop5Nekretnina(lokacija, function(error, nekretnine) {
        if (error) {
            console.error('Error loading top 5 properties:', error);
            return;
        }

        const top5Div = document.getElementById('top5-nekretnina');
        
        //css za top 5 nekretnina
        top5Div.innerHTML = '';
        top5Div.style.display = 'grid';
        top5Div.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        top5Div.style.gap = '20px';
        top5Div.style.padding = '20px';

        nekretnine.forEach(nekretnina => {
            const nekretniaDiv = document.createElement('div');
            nekretniaDiv.className = 'nekretnina-card';
            nekretniaDiv.style.border = '1px solid #ddd';
            nekretniaDiv.style.borderRadius = '8px';
            nekretniaDiv.style.padding = '15px';
            nekretniaDiv.style.backgroundColor = '#fff';
            nekretniaDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            let slika="";
            if(nekretnina.tip_nekretnine=="Stan"){
                slika="stan";
            }
            else{
                slika="Kuca";
            }
            nekretniaDiv.innerHTML = `
                <img src="../HTML/slike/${slika}${nekretnina.id}.jpg" 
                     alt="Nekretnina" 
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;">
                <h3 style="margin: 10px 0; font-size: 1.2em;">${nekretnina.naziv}</h3>
                <div style="color: #666;">
                    <p style="margin: 5px 0;">Kvadratura: ${nekretnina.kvadratura} m²</p>
                    <p style="margin: 5px 0;">Cijena: ${nekretnina.cijena} KM</p>
                    <p style="margin: 5px 0;">Lokacija: ${nekretnina.lokacija}</p>
                </div>
            `;

            // Hover efekat
            nekretniaDiv.addEventListener('mouseover', () => {
                nekretniaDiv.style.transform = 'translateY(-5px)';
                nekretniaDiv.style.transition = 'transform 0.2s ease';
            });

            nekretniaDiv.addEventListener('mouseout', () => {
                nekretniaDiv.style.transform = 'translateY(0)';
            });

            top5Div.appendChild(nekretniaDiv); 
        });
    });
}












//Za meni
document.addEventListener("DOMContentLoaded", function () {
    fetch("../HTML/meni.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("meni").innerHTML = data;
      })
      .catch((error) => console.error("Greška pri učitavanju menija:", error));
  });

  


document.getElementById('btnPrethodni').onclick = function() {
    trenutniIndeks = (trenutniIndeks - 1 + nizInteresovanja.length) % nizInteresovanja.length;
    prikaziInteresovanje(trenutniIndeks);
};

document.getElementById('btnSljedeci').onclick = function() {
    trenutniIndeks = (trenutniIndeks + 1) % nizInteresovanja.length;
    prikaziInteresovanje(trenutniIndeks);
};

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = urlParams.get('id');
    
    if (nekretninaId) {
        ucitajDetaljeNekretnine(nekretninaId);
        initInteresovanjeForm();
    }
});


