const listaNekretnina = [
    {
      id: 1,
      tip_nekretnine: "Stan",
      naziv: "Useljiv stan Sarajevo",
      kvadratura: 58,
      cijena: 232000,
      tip_grijanja: "plin",
      lokacija: "Novo Sarajevo",
      godina_izgradnje: 2019,
      datum_objave: "01.10.2023.",
      opis: "Sociis natoque penatibus.",
      upiti: [
        {
          korisnik_id: 1,
          tekst_upita: "Nullam eu pede mollis pretium.",
        },
        {
          korisnik_id: 2,
          tekst_upita: "Phasellus viverra nulla.",
        },
      ],
    },
    {
      id: 1,
      tip_nekretnine: "Stan",
      naziv: "Useljiv stan Sarajevo",
      kvadratura: 58,
      cijena: 32000,
      tip_grijanja: "plin",
      lokacija: "Novo Sarajevo",
      godina_izgradnje: 2019,
      datum_objave: "01.10.2009.",
      opis: "Sociis natoque penatibus.",
      upiti: [
        {
          korisnik_id: 1,
          tekst_upita: "Nullam eu pede mollis pretium.",
        },
        {
          korisnik_id: 2,
          tekst_upita: "Phasellus viverra nulla.",
        },
      ],
    },
    {
      id: 1,
      tip_nekretnine: "Stan",
      naziv: "Useljiv stan Sarajevo",
      kvadratura: 58,
      cijena: 232000,
      tip_grijanja: "plin",
      lokacija: "Novo Sarajevo",
      godina_izgradnje: 2019,
      datum_objave: "01.10.2003.",
      opis: "Sociis natoque penatibus.",
      upiti: [
        {
          korisnik_id: 1,
          tekst_upita: "Nullam eu pede mollis pretium.",
        },
        {
          korisnik_id: 2,
          tekst_upita: "Phasellus viverra nulla.",
        },
      ],
    },
    {
      id: 2,
      tip_nekretnine: "Kuća",
      naziv: "Mali poslovni prostor",
      kvadratura: 20,
      cijena: 70000,
      tip_grijanja: "struja",
      lokacija: "Centar",
      godina_izgradnje: 2005,
      datum_objave: "20.08.2023.",
      opis: "Magnis dis parturient montes.",
      upiti: [
        {
          korisnik_id: 2,
          tekst_upita: "Integer tincidunt.",
        },
      ],
    },
    {
      id: 3,
      tip_nekretnine: "Kuća",
      naziv: "Mali poslovni prostor",
      kvadratura: 20,
      cijena: 70000,
      tip_grijanja: "struja",
      lokacija: "Centar",
      godina_izgradnje: 2005,
      datum_objave: "20.08.2023.",
      opis: "Magnis dis parturient montes.",
      upiti: [
        {
          korisnik_id: 2,
          tekst_upita: "Integer tincidunt.",
        },
      ],
    },
    {
      id: 4,
      tip_nekretnine: "Kuća",
      naziv: "Mali poslovni prostor",
      kvadratura: 20,
      cijena: 70000,
      tip_grijanja: "struja",
      lokacija: "Centar",
      godina_izgradnje: 2005,
      datum_objave: "20.08.2023.",
      opis: "Magnis dis parturient montes.",
      upiti: [
        {
          korisnik_id: 2,
          tekst_upita: "Integer tincidunt.",
        },
      ],
    },
  ];
  
  const listaKorisnika = [
    {
      id: 1,
      ime: "Neko",
      prezime: "Nekic",
      username: "username1",
    },
    {
      id: 2,
      ime: "Neko2",
      prezime: "Nekic2",
      username: "username2",
    },
  ];
  



//POMOCNA FUNKCIJA ZA CRTANJE HISTOGRAMA
function iscrtajHistogram(histogram, periodi, rasponiCijena) {
  // Brisanje prethodnih grafova
  document.getElementById('chartsContainer').innerHTML = '';

  periodi.forEach((period, periodIndex) => {
      // Kreiranje div-a za svaki period
      let chartDiv = document.createElement('div');
      chartDiv.classList.add('chart-container');
      document.getElementById('chartsContainer').appendChild(chartDiv);

      // Kreiranje canvas elementa unutar svakog div-a
      let canvas = document.createElement('canvas');
      chartDiv.appendChild(canvas);

      // Kreiranje podataka za graf
      let labels = rasponiCijena.map(range => `${range.od} - ${range.do}`);
      let data = rasponiCijena.map((range, priceIndex) => {
          // Filtriranje broja nekretnina unutar cijena za jedan period
          return histogram
              .filter(item => item.indeksPerioda === periodIndex && item.indeksRasporedaCijena === priceIndex)
              .map(item => item.brojNekretnina)[0] || 0;
      });

      // Kreiranje grafova pomoću Chart.js
      new Chart(canvas, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: `Broj Nekretnina (${period.od}-${period.do})`,
                  data: data,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  title: {
                      display: true,
                      text: `Histogram za period ${period.od} - ${period.do}`
                  }
              },
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Rasponi Cijena'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: 'Broj Nekretnina'
                      },
                      beginAtZero: true
                  }
              }
          }
      });
  });
}



/*NAPOMENA: Validacija unesenih podatak bi zasigurno mogla biti jos kvalitetnije uradjena, medjutim u tekstu spirale se nigdje nije navodilo da treba voditi posebno racuna o tome,
tako da sam u ovom dijelu odradio samo najosnovniju validaciju*/




// Povezivanje sa prethodno implementiranim funkcijama

let nekretnine = SpisakNekretnina();
nekretnine.init(listaNekretnina, listaKorisnika);


let statistikaNekretnina=StatistikaNekretnina();
statistikaNekretnina.init(listaNekretnina,listaKorisnika);


//LISTENER ZA KVADRATURU

document.getElementById('izracunajKvadraturu').addEventListener('click',function(){

let tipNekretnine = document.getElementById('tipNekretnine').value;
let minKvadratura = document.getElementById('minKvadratura').value;
let maxKvadratura = document.getElementById('maxKvadratura').value;
let minCijena = document.getElementById('minCijena').value;
let maxCijena = document.getElementById('maxCijena').value;
//ostala polja nisu uzeta u razmatranje zato sto funkcija filtrirajNekretnine nije implementirana tako da je moguce filtriranje i po njima(napisano i na statistika.html)

let kriterij={};
if(tipNekretnine) {kriterij.tip_nekretnine=tipNekretnine}
if(minKvadratura){kriterij.min_kvadratura=parseInt(minKvadratura)}
if(maxKvadratura){kriterij.max_kvadratura=parseInt(maxKvadratura)}
if(minCijena){kriterij.min_cijena=parseInt(minCijena)}
if(maxCijena){kriterij.max_cijena=parseInt(maxCijena)}

let rezultat = statistikaNekretnina.prosjecnaKvadratura(kriterij); 


if(!rezultat){
    document.getElementById('rezultat').value = "Ne postoji takva nekretnina ili niste ispravno unijeli podatke!";

}
else{
document.getElementById('rezultat').value = 'Prosječna kvadratura je: ' + rezultat;
}
});





//LISTENER ZA OUTLIER
document.getElementById('nadjiOutlier').addEventListener('click',function(){

 
let tipNekretnine = document.getElementById('tipNekretnine').value;
let minKvadratura = document.getElementById('minKvadratura').value;
let maxKvadratura = document.getElementById('maxKvadratura').value;
let minCijena = document.getElementById('minCijena').value;
let maxCijena = document.getElementById('maxCijena').value;
let nazivSvojstva = document.getElementById('svojstvo').value;
//ostala polja nisu uzeta u razmatranje zato sto funkcija filtrirajNekretnine nije implementirana tako da je moguce filtriranje i po njima(napisano i na statistika.html)



let kriterij={};
if(tipNekretnine) {kriterij.tip_nekretnine=tipNekretnine}
if(minKvadratura){kriterij.min_kvadratura=parseInt(minKvadratura)}
if(maxKvadratura){kriterij.max_kvadratura=parseInt(maxKvadratura)}
if(minCijena){kriterij.min_cijena=parseInt(minCijena)}
if(maxCijena){kriterij.max_cijena=parseInt(maxCijena)}

let rezultat = statistikaNekretnina.outlier(kriterij,nazivSvojstva); 

if(!rezultat){
    document.getElementById('rezultatOutlier').value = "Ne postoji takva nekretnina ili niste ispravno unijeli podatke!";

}
else{
    document.getElementById('rezultatOutlier').value = 'Outlier je nekretnina: ' +'\nID: '+ rezultat.id +'\nTip nekretnine: ' + rezultat.tip_nekretnine+'\nNaziv: '+rezultat.naziv
    +'\nKvadratura: '+rezultat.kvadratura+'\nCijena: '+rezultat.cijena+'\nTip grijanja: '+rezultat.tip_grijanja+'\nLokacija: '+rezultat.lokacija+'\nGodina izgradnje: '+rezultat.godina_izgradnje+
    '\nDatum objave: '+rezultat.datum_objave+'\nOpis: '+rezultat.opis;
}

});
    





    //LISTENER ZA MOJE NEKRETNINE
    document.getElementById('mojeNekretnine').addEventListener('click',function(){
    
        let korisnik=document.getElementById('korisnik').value;
        let korisnikPodaci = korisnik.split(' ');

        if (korisnikPodaci.length != 2) {
            alert("Unesite naziv korisnika u ispravnom formatu!");
            return
        }

        let ime = korisnikPodaci[0];      
        let prezime = korisnikPodaci[1];  



        let pronadjiKorisnikaPoImenuIPrezimenu = function (ime, prezime) {
            // Pretražujem listu korisnika u okviru objekta spisakNekretnina
            let korisnik = listaKorisnika.find(k => k.ime === ime && k.prezime === prezime);
            
            // Provjera da li je korisnik pronađen
            if (korisnik) {
                return korisnik;
            } else {
                return null;
            }
        }
        

let pronadjenKorisnik=pronadjiKorisnikaPoImenuIPrezimenu(ime,prezime);
if(!pronadjenKorisnik){
    document.getElementById('rezultatNekretnine').value = "Nije pronađen korisnik!";
return;
}

let nizNekretnina = statistikaNekretnina.mojeNekretnine(pronadjenKorisnik);
let naziviNekretnina = [];


for (let i = 0; i < nizNekretnina.length; i++) {
    naziviNekretnina.push(nizNekretnina[i].naziv);
}

// Ispis naziva svake nekretnine
document.getElementById('rezultatNekretnine').value="Tražene nekretnine imaju nazive: " + naziviNekretnina.join(', ');

});




//LISTENER ZA HISTOGRAM
document.getElementById('generateHistogram').addEventListener('click', function () {
    let periodi = document.getElementById('periodi').value;
    let cijene = document.getElementById('cijene').value;



    // Provjera validnosti
    if (!periodi || !cijene || periodi.charAt(0)=='-' || periodi.includes("--" || periodi.includes("- "))) {
        alert("Molimo unesite validne vrijednosti.");
        return;
    }

    // Parsiranje perioda
    let periodiArray = periodi.split(',').map(period => {
        let parts = period.split('-').map(num => parseInt(num.trim()));
        if (parts.length !== 2 || parts.includes(NaN)) {
            alert('Nevalidan period: ', period);
            return null;  
        }
        return { od: parts[0], do: parts[1] };
    }).filter(period => period !== null);  

    // Parsiranje cijena
    let cijeneArray = cijene.split(',').map(cijena => {
        let parts = cijena.split('-').map(num => parseInt(num.trim()));
        if (parts.length !== 2 || parts.includes(NaN)) {
            alert('Nevalidan raspon cijena: ', cijena);
            return null;  
        }
        return { od: parts[0], do: parts[1] };
    }).filter(cijena => cijena !== null);  

    /*if (periodiArray.length !== cijeneArray.length) {
        alert("Broj perioda i cijena se ne poklapa.");              // AKO BROJ INTERVALA ZA VRIJEME I CIJENE MORA BITI JEDNAK ONDA SE DODAJE I OVAJ USLOV, IZ TEKSTA NIJE NAJJASNIJE
        return;
    }

*/
/*
    for (let i = 0; i < periodiArray.length; i++) {
        for (let j = 0; j < cijeneArray.length; j++) {
            let histogram = statistikaNekretnina.histogramCijena(periodiArray, cijeneArray);    //AKO BROJ GRAFOVA TREBA DA BUDE BROJ_VREMENSKIH_RASPONA*BROJ_RASPONA_CIJENA
            
            iscrtajHistogram(histogram, periodiArray, cijeneArray);
        }
    }*/
      let histogram = statistikaNekretnina.histogramCijena(periodiArray, cijeneArray);           //BROJ GRAFOVA JEDNAK JE BROJU VREMENSKIH RASPONA

      iscrtajHistogram(histogram, periodiArray, cijeneArray);
});
