function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
  // pozivanje metode za filtriranje
  const filtriraneNekretnine = instancaModula.filtrirajNekretnine({
    tip_nekretnine: tip_nekretnine,
  });

  // Ciscenje svih elemenata liste
  divReferenca.innerHTML = "";

  if (filtriraneNekretnine.length === 0) {
    divReferenca.innerHTML =
      "<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>";
  } else {
    filtriraneNekretnine.forEach((nekretnina) => {
      const nekretninaElement = document.createElement("div");
      if (tip_nekretnine === "Stan") {
        nekretninaElement.classList.add("nekretnina", "stan");
        nekretninaElement.id = `${nekretnina.id}`;
      } else if (tip_nekretnine === "Poslovni prostor") {
        nekretninaElement.classList.add("nekretnina", "pp");
        nekretninaElement.id = `${nekretnina.id}`;
      }

      // Added search and click count divs
      const pretrageDiv = document.createElement("div");
      pretrageDiv.id = `pretrage-${nekretnina.id}`;
      pretrageDiv.textContent = `pretrage: ${nekretnina.pretrage || 0}`;
      nekretninaElement.appendChild(pretrageDiv);

      const klikoviDiv = document.createElement("div");
      klikoviDiv.id = `klikovi-${nekretnina.id}`;
      klikoviDiv.textContent = `klikovi: ${nekretnina.klikovi || 0}`;
      nekretninaElement.appendChild(klikoviDiv);

      const slikaElement = document.createElement("img");
      slikaElement.classList.add("slika-nekretnine");
      if (nekretnina.tip_nekretnine == "Stan")
        slikaElement.src = `../HTML/slike/stan${nekretnina.id}.jpg`;
      else {
        slikaElement.src = `../HTML/slike/Kuca${nekretnina.id}.jpg`;
      }
      slikaElement.alt = nekretnina.naziv;
      nekretninaElement.appendChild(slikaElement);

      const detaljiElement = document.createElement("div");
      detaljiElement.classList.add("detalji-nekretnine");
      detaljiElement.innerHTML = `
              <h3>${nekretnina.naziv}</h3>
              <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
          `;
      nekretninaElement.appendChild(detaljiElement);

      const cijenaElement = document.createElement("div");
      cijenaElement.classList.add("cijena-nekretnine");
      cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
      nekretninaElement.appendChild(cijenaElement);

      const detaljiDugme = document.createElement("button"); // Promijenili smo u button umjesto a
      detaljiDugme.classList.add("detalji-dugme");
      detaljiDugme.textContent = "Detalji";

      // Direktno postavljamo ID nekretnine kao podatak na dugme
      detaljiDugme.setAttribute("data-id", nekretnina.id);

      detaljiDugme.addEventListener("click", function (e) {
        e.preventDefault(); // Spriječiti default akciju ako je potrebno
        const idNekretnine = this.getAttribute("data-id");
        if (
          typeof MarketingAjax !== "undefined" &&
          MarketingAjax.klikNekretnina
        ) {
          MarketingAjax.klikNekretnina(idNekretnine);
        } else {
          console.error(
            "MarketingAjax nije definiran ili nema metodu klikNekretnina"
          );
        }
      });

      nekretninaElement.appendChild(detaljiDugme);

      // Dodavanje kreiranog elementa u divReferenci
      divReferenca.appendChild(nekretninaElement);
    });
  }
}

const listaNekretnina = [];
const listaKorisnika = [];

// Get the grid-lista-nekretnina divs inside their respective containers
const divStan = document.querySelector(
  "#stanoviContainer .grid-lista-nekretnina"
);
const divPp = document.querySelector(
  "#poslovniProstoriContainer .grid-lista-nekretnina"
);

// Instanciranje modula
let nekretnine = SpisakNekretnina();

// Pozivamo funkciju za dohvat nekretnina sa servera
PoziviAjax.getNekretnine((error, listaNekretnina) => {
  if (error) {
    console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
  } else {
    // Inicijalizacija modula sa dobavljenim podacima
    nekretnine.init(listaNekretnina, listaKorisnika);

    // Pozivamo funkciju za prikaz nekretnina
    spojiNekretnine(divStan, nekretnine, "Stan");
    spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
  }
});

function filtrirajNekretnine(filtriraneNekretnine) {
  const filtriraneNekretnineInstance = SpisakNekretnina();
  filtriraneNekretnineInstance.init(filtriraneNekretnine, listaKorisnika);

  spojiNekretnine(divStan, filtriraneNekretnineInstance, "Stan");
  spojiNekretnine(divPp, filtriraneNekretnineInstance, "Poslovni prostor");
}

function filtrirajOnClick() {
  const kriterij = {
    min_cijena: parseFloat(document.getElementById("minCijena").value) || 0,
    max_cijena:
      parseFloat(document.getElementById("maxCijena").value) || Infinity,
    min_kvadratura:
      parseFloat(document.getElementById("minKvadratura").value) || 0,
    max_kvadratura:
      parseFloat(document.getElementById("maxKvadratura").value) || Infinity,
  };

  const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);

  MarketingAjax.novoFiltriranje(
    filtriraneNekretnine.map((nekretnina) => nekretnina.id)
  );

  filtrirajNekretnine(filtriraneNekretnine);
}

document
  .getElementById("dugmePretraga")
  .addEventListener("click", filtrirajOnClick);

setInterval(() => {
  MarketingAjax.osvjeziPretrage(document.querySelector(".tip-nekretnine"));
  MarketingAjax.osvjeziKlikove(document.querySelector(".tip-nekretnine"));
}, 500);



























//SPIRALA 3




// Dohvatanje parametara URL-a
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Funkcija za dohvat nekretnina prema tipu
function getNekretnineByTip(nekretnine, tip) {
  return nekretnine.filter(
    (nekretnina) =>
      nekretnina.tip_nekretnine.toLowerCase() === tip.toLowerCase()
  );
}

function prikaziNekretnine() {
  // Dohvatanje podataka pomoću metode iz aajaxa
  PoziviAjax.getNekretnine(function (error, nekretnine) {
    if (error) {
      console.error("Greška pri učitavanju nekretnina:", error);
      return;
    }

    // Filtriranje nekretnina prema tipu
    const stanovi = getNekretnineByTip(nekretnine, "Stan");
    const poslovniProstori = getNekretnineByTip(nekretnine, "Poslovni Prostor");

    const stanoviContainer = document
      .getElementById("stanoviContainer")
      .querySelector(".grid-lista-nekretnina");
    const poslovniProstoriContainer = document
      .getElementById("poslovniProstoriContainer")
      .querySelector(".grid-lista-nekretnina");

    // Čišćenje prethodnog sadržaja
    stanoviContainer.innerHTML = "";
    poslovniProstoriContainer.innerHTML = "";

    // Prikaz stanova
    if (stanovi.length === 0) {
      stanoviContainer.innerHTML = "<p>Trenutno nema dostupnih stanova.</p>";
    } else {
      stanovi.forEach((stan) => {
        const stanElement = document.createElement("div");
        stanElement.classList.add("nekretnina");
        stanElement.innerHTML = `
          <img class="slika-nekretnine" src="../HTML/slike/stan${stan.id}.jpg" alt="${stan.naziv}">
          <div class="detalji-nekretnine">
            <h3>${stan.naziv}</h3>
            <p>Lokacija: ${stan.lokacija}</p>
            <p>Cijena: ${stan.cijena} BAM</p>
            <p>Kvadratura: ${stan.kvadratura} m²</p>
            <button onclick="window.location.href='detalji.html?id=${stan.id}'" class="detalji-dugme">Detalji</button>
          </div>
        `;
        stanoviContainer.appendChild(stanElement);
      });
    }

    // Prikaz poslovnih prostora
    if (poslovniProstori.length === 0) {
      poslovniProstoriContainer.innerHTML =
        "<p>Trenutno nema dostupnih poslovnih prostora.</p>";
    } else {
      poslovniProstori.forEach((pp) => {
        const ppElement = document.createElement("div");
        ppElement.classList.add("nekretnina");
        ppElement.innerHTML = `
          <img class="slika-nekretnine" src="../HTML/slike/Kuca${pp.id}.jpg" alt="${pp.naziv}">
          <div class="detalji-nekretnine">
            <h3>${pp.naziv}</h3>
            <p>Lokacija: ${pp.lokacija}</p>
            <p>Cijena: ${pp.cijena} BAM</p>
            <p>Kvadratura: ${pp.kvadratura} m²</p>
            <button onclick="window.location.href='detalji.html?id=${pp.id}'" class="detalji-dugme">Detalji</button>
          </div>
        `;
        poslovniProstoriContainer.appendChild(ppElement);
      });
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  fetch("../HTML/meni.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("meni").innerHTML = data;
    })
    .catch((error) => console.error("Greška pri učitavanju menija:", error));
});

document.addEventListener("DOMContentLoaded", prikaziNekretnine);
