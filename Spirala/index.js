const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const rateLimit = {};

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'data', 'prijave.txt');
const BLOCK_TIME = 60000;
const MAX_ATTEMPTS = 3;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

app.use(express.json());













//ZA BAZU
const bodyParser = require("body-parser");
const sequelize = require("./public/JS/baza.js");

const UpitModel = require("./public/JS/Modeli/UpitModel.js");
const ZahtjevModel = require("./public/JS/Modeli/ZahtjevModel");
const PonudaModel = require("./public/JS/Modeli/PonudaModel.js");
const KorisnikModel = require("./public/JS/Modeli/KorisnikModel.js");
const NekretninaModel = require("./public/JS/Modeli/NekretninaModel.js");



const Upit = UpitModel(sequelize);
const Zahtjev = ZahtjevModel(sequelize);
const Ponuda = PonudaModel(sequelize);
const Korisnik = KorisnikModel(sequelize);
const Nekretnina = NekretninaModel(sequelize);



// Kreiramo objekat sa svim modelima
const models = {
  Upit,
  Zahtjev,
  Ponuda,
  Korisnik,
  Nekretnina
};


/*


app.use(bodyParser.json());


Korisnik.sync();         //kreirali smo tabele iz modela
Nekretnina.sync();
Upit.sync();
Ponuda.sync();
Zahtjev.sync();
veze.sync();

*/


// Samo pozivamo funkciju za definisanje veza
require("./public/JS/Modeli/veze.js")(models);
const initializeUsers = require("./public/JS/korisnici.js");

app.use(bodyParser.json());

// Sinhronizujemo sve modele odjednom
//sequelize.sync();
(async () => {
  try {
      await sequelize.sync({ alter: true }); // Sinhronizuje sve tabele

      await initializeUsers(Korisnik);
      console.log("Korisnici su inicijalizovani.");
  } catch (err) {
      console.error("Greška prilikom inicijalizacije baze ili korisnika:", err);
  }
})();








/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/HTML', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  { route: '/vijesti.html', file: 'vijesti.html' },
  { route: '/mojiUpiti.html', file: 'mojiUpiti.html' },
  { route: '/statistika.html', file: 'statistika.html' }

  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}












//SPIRALA 4











// Modificirana POST /login ruta
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const currentTime = Date.now();

  console.log(username);
  console.log(password);
  try {
    // Inicijalizacija rate limita za korisnika
    if (!rateLimit[username]) {
      rateLimit[username] = { attempts: 0, blockedUntil: 0 };
    }

    const userRateLimit = rateLimit[username];

    // Provjera da li je korisnik blokiran
    if (currentTime < userRateLimit.blockedUntil) {
      const logEntry = `[${new Date().toISOString()}] - username: "${username}" - status: "neuspješno (blokiran)"`;
      await fs.appendFile(LOG_FILE, logEntry + '\n');

      return res.status(429).json({ greska: "Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu." });
    }

    // Pronalazak korisnika u bazi
    const korisnik = await Korisnik.findOne({ where: { username } });
    let loginStatus = "neuspješno";

    if (korisnik) {
  
  
      // Provjera lozinke    
      const isPasswordValid = await bcrypt.compare(password, korisnik.password);
      //const isPasswordValid = password===korisnik.password;

      if (isPasswordValid) {
        // Reset rate limita nakon uspješne prijave
        userRateLimit.attempts = 0;
        loginStatus = "uspješno";

        // Postavljanje sesije
        req.session.username = korisnik.username;
        req.session.userId = korisnik.id;
        req.session.isAdmin = korisnik.admin;

        const logEntry = `[${new Date().toISOString()}] - username: "${username}" - status: "${loginStatus}"`;
        await fs.appendFile(LOG_FILE, logEntry + '\n');

        return res.json({ poruka: 'Uspješna prijava' });
      }
    }

    // Neuspješna prijava
    userRateLimit.attempts += 1;
    if (userRateLimit.attempts >= MAX_ATTEMPTS) {
      userRateLimit.blockedUntil = currentTime + BLOCK_TIME;
      userRateLimit.attempts = 0;
    }

    const logEntry = `[${new Date().toISOString()}] - username: "${username}" - status: "${loginStatus}"`;
    await fs.appendFile(LOG_FILE, logEntry + '\n');

    if (userRateLimit.blockedUntil > currentTime) {
      return res.status(429).json({ greska: "Previše neuspješnih pokušaja. Pokušajte ponovo za 1 minutu." });
    }

    return res.json({ poruka: 'Neuspješna prijava' });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ greska: 'Internal Server Error' });
  }
});















//Modificirana /logout ruta

app.post('/logout', (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Greška pri odjavi:', err);
      return res.status(500).json({ greska: 'Internal Server Error' });
    }
    res.clearCookie('sid');
    return res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
});















// Modificirana GET /nekretnine ruta
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await Nekretnina.findAll();
    res.json(nekretnine);
  } catch (error) {
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});












// Modificirana GET /korisnik route
app.get('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const user = await Korisnik.findOne({
      where: { username: req.session.username },
      attributes: ['id', 'ime', 'prezime', 'username', 'password','admin']  
    });

    if (!user) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});













// Modificirana POST /upit route
app.post('/upit', async (req, res) => {

  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { nekretnina_id, tekst } = req.body;

  try {
    const user = await Korisnik.findOne({
      where: { username: req.session.username }
    });

    const nekretnina = await Nekretnina.findByPk(nekretnina_id);

    if (!nekretnina) {
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    // Prebroj postojeće upite
    const brojUpita = await Upit.count({
      where: {
        KorisnikId: user.id,
        NekretninaId: nekretnina_id
      }
    });

    if (brojUpita >= 3) {
      return res.status(429).json({ greska: 'Previse upita za istu nekretninu.' });
    }

    // Kreiraj novi upit
    await Upit.create({
      tekst: tekst,
      KorisnikId: user.id,
      NekretninaId: nekretnina_id
    });

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error eeeeeeeeeeeeeeeeeeee:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});














// Modificirana PUT /korisnik ruta
app.put('/korisnik', async (req, res) => {

  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { ime, prezime, username, password } = req.body;

  try {
    const user = await Korisnik.findOne({
      where: { username: req.session.username }
    });

    if (!user) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    const updates = {};
    if (ime) updates.ime = ime;
    if (prezime) updates.prezime = prezime;
    if (username) updates.username = username;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});














// Modificirana GET /nekretnine ruta
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnineData = await Nekretnina.findAll(); 
    res.json(nekretnineData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});














// ----------------- MARKETING ROUTES ----------------- 

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




















app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});










app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});















app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});










// Modificirana GET /nekretnine/top5 ruta
app.get('/nekretnine/top5', async (req, res) => {
  const lokacija = req.query.lokacija;

  if (!lokacija) {
    return res.status(400).json({ error: 'Lokacija nije specificirana.' });
  }

  try {
    // Pronađi nekretnine sa specificiranom lokacijom
    const nekretnine = await Nekretnina.findAll({
      where: { lokacija },
      order: [['datum_objave', 'DESC']],  // Sortiranje po datum_objave opadajuće
      limit: 5
    });

    // Ako nema nekretnina za zadatu lokaciju
    if (nekretnine.length === 0) {
      return res.status(404).json({ error: 'Nema nekretnina za ovu lokaciju.' });
    }

    // Pošaljemo rezultate kao odgovor
    return res.status(200).json(nekretnine);
  } catch (error) {
    console.error("Greška prilikom obrade podataka: ", error);
    return res.status(500).json({ error: 'Greška prilikom obrade podataka.' });
  }
});





















// Modificirana GET /upiti/moji ruta
app.get('/upiti/moji', async (req, res) => {


  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }


  try {
    const user = await Korisnik.findOne({
      where: { username: req.session.username },
      include: [{
        model: Upit,
        include: [{
          model: Nekretnina,
          attributes: ['id']
        }],
        attributes: ['tekst']
      }]
    });

    if (!user) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    const filteredUpiti = user.Upits.map(upit => ({
      id_nekretnine: upit.Nekretnina.id,
      tekst: upit.tekst
    }));
console.log("UPITI: ",filteredUpiti);
    return res.status(200).json(filteredUpiti);
  } catch (error) {
    console.error('Greška:', error);
    return res.status(500).json({ greska: 'Greška na serveru' });
  }
});





















// Modificirana get /nekretnina/:id ruta
app.get('/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);  
  console.log(nekretninaId);
  try {
    // Pronalazak nekretnine u bazi sa zadanim id-em
    const nekretnina = await Nekretnina.findOne({
      where: { id: nekretninaId },
      include: [{
        model: Upit,
        attributes: ['id', 'tekst', 'NekretninaId'], 
        limit: 3
      }]
    });

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} nije pronađena` });
    }

    // Vraćamo detalje o nekretnini, uključujući poslednje 3 upita
    return res.status(200).json({
      id: nekretnina.id,
      tip_nekretnine: nekretnina.tip_nekretnine,
      naziv: nekretnina.naziv,
      kvadratura: nekretnina.kvadratura,
      cijena: nekretnina.cijena,
      tip_grijanja: nekretnina.tip_grijanja,
      lokacija: nekretnina.lokacija,
      godina_izgradnje: nekretnina.godina_izgradnje,
      datum_objave: nekretnina.datum_objave,
      opis: nekretnina.opis,
      upiti: nekretnina.Upits.map(upit => ({
        id: upit.id,
        tekst: upit.tekst,
        NekretninaId: upit.NekretninaId
      }))
    });

  } catch (error) {
    console.error('Greška prilikom obrade nekretnine:', error);
    return res.status(500).json({ greska: 'Greška na serveru' });
  }
});












// Modificirana GET /next/upiti/nekretnina:id ruta
app.get('/next/upiti/nekretnina:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10); 
  const page = parseInt(req.query.page, 10);  

  if (page < 0) {
    // Ako je page < 0, vraćamo prazan niz
    return res.status(404).json([]);
  }

  try {
    const nekretnina = await Nekretnina.findByPk(nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} nije pronađena` });
    }

    // Ako je page 0, vraćamo posljednja tri upita
    if (page === 0) {
      const lastUpiti = await Upit.findAll({
        where: { NekretninaId: nekretninaId },
        limit: 3,
        order: [['id', 'DESC']], 
        attributes: ['tekst']
      });

      return res.status(200).json(lastUpiti);
    }

    const offset = page * 3; 
    const nextUpiti = await Upit.findAll({
      where: { NekretninaId: nekretninaId },
      limit: 3,
      offset: offset,
      order: [['id', 'DESC']], 
      attributes: ['tekst']
    });

    if (nextUpiti.length === 0) {
      return res.status(404).json([]); // Ako nema više upita
    }

    return res.status(200).json(nextUpiti); 
  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    return res.status(500).json({ greska: 'Greška na serveru' });
  }
});









//POMOCNA

async function mozeVidjetiCijenuPonude(ponuda, currentUser) {
  if(!currentUser) return false;
  if(ponuda.KorisnikId === currentUser.id) return true;

  if(ponuda.vezanaPonudaId) {
    const glavna = await Ponuda.findByPk(ponuda.vezanaPonudaId);
    if(!glavna) return false;
    
    return await mozeVidjetiCijenuPonude(glavna, currentUser);
  }

  return false;
}





// Nova GET /nekretnina/:id/interesovanja ruta

app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  try {
      const nekretnina = await Nekretnina.findByPk(req.params.id);
      if(!nekretnina) {
          return res.status(404).json({ greska: 'Nekretnina ne postoji' });
      }

      const interesovanja = await nekretnina.getInteresovanja();
      if(!interesovanja.length) {
          return res.status(200).json([]);
      }

      const isLoggedIn = !!req.session.username;
      let currentUser = null;
      let isAdmin = false;

      if(isLoggedIn) {
          currentUser = await Korisnik.findOne({ where: { username: req.session.username }});
          if(currentUser && currentUser.admin) {
              isAdmin = true;
          }
      }

      if(isAdmin) {
          return res.status(200).json(interesovanja);
      } else {
          const filtrirano = await Promise.all(interesovanja.map(async (item) => {
              if(item.dataValues.hasOwnProperty('tekst') && !item.dataValues.hasOwnProperty('datumPonude')) {
                  return item;
              }

              if(item.dataValues.hasOwnProperty('trazeniDatum')) {
                  return item;
              }

              if(item.dataValues.hasOwnProperty('cijenaPonude')) {
                  if(!isLoggedIn || (currentUser && item.KorisnikId !== currentUser.id)) {
                      const mozeVidjeti = await mozeVidjetiCijenuPonude(item, currentUser);

                      if(!mozeVidjeti) {
                          const copy = { ...item.dataValues };
                          delete copy.cijenaPonude;
                          return copy;
                      }
                  }
              }

              return item;
          }));

          if (!isLoggedIn) {
              filtrirano.forEach((item) => {
                  if (item.dataValues?.cijenaPonude !== undefined) {
                      delete item.dataValues.cijenaPonude;
                  }
              });
          }

          return res.status(200).json(filtrirano);
      }
  } catch (error) {
      console.error('Greška prilikom dohvatanja interesovanja:', error);
      res.status(500).json({ greska: 'Internal Server Error' });
  }
});











//POMOCNE METODE

async function provjeriLanacPonudaPripadaKorisniku(ponuda, korisnikId) {
  // Provjera da li trenutna ponuda pripada korisniku
  if (ponuda.KorisnikId === korisnikId) {
      return true;
  }

  // Ako postoji vezana ponuda, dohvatiti roditeljsku ponudu i provjeriti rekurzivno
  if (ponuda.vezanaPonudaId) {
      const glavnaPonuda = await Ponuda.findByPk(ponuda.vezanaPonudaId);

      if (!glavnaPonuda) {
          return false; // Ako roditeljska ponuda ne postoji, lanac nije validan
      }

      // Rekurzivno provjeriti roditeljsku ponudu
      return await provjeriLanacPonudaPripadaKorisniku(glavnaPonuda, korisnikId);
  }

  return false; // Ako nema vezane ponude i trenutna ponuda ne pripada korisniku
}





async function imaOdbijenaPonudaULancu(ponuda) {
  if (ponuda.odbijenaPonuda === true) {
    return true; // Ako je odbijenaPonuda true, vraćamo true
  }

  if (ponuda.vezanaPonudaId) {
    const glavnaPonuda = await Ponuda.findByPk(ponuda.vezanaPonudaId);

    if (!glavnaPonuda) {
      return false;
    }

    return await imaOdbijenaPonudaULancu(glavnaPonuda);
  }

  return false;
}










// Nova POST /nekretnina/:id/ponuda ruta


app.post('/nekretnina/:id/ponuda', async (req, res) => {
  const nekretninaId = req.params.id;
  let { tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda } = req.body;

  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
console.log("1");
  try {
    const user = await Korisnik.findOne({ where: { username: req.session.username } });
    if(!user) {
      return res.status(401).json({ greska: 'Korisnik ne postoji' });
    }

    const nek = await Nekretnina.findByPk(nekretninaId);
    if(!nek) {
      return res.status(404).json({ greska: 'Nekretnina ne postoji' });
    }

    if(idVezanePonude) {
      const parentPonuda = await Ponuda.findByPk(idVezanePonude);
      if(!parentPonuda) {
        return res.status(400).json({ greska: 'Neispravan idVezanePonude' });
      }
      console.log("2");

      const imaOdbijenu = await imaOdbijenaPonudaULancu(parentPonuda);
      if(imaOdbijenu) {
        return res.status(400).json({ greska: 'U lancu već postoji odbijena ponuda, nije moguće kreirati novu ponudu.' });
      }
      console.log("3");

      if(!user.admin) {
        const lanacJeNjegov = await provjeriLanacPonudaPripadaKorisniku(parentPonuda, user.id);
        if(!lanacJeNjegov) {
          return res.status(403).json({ greska: 'Nije vam dozvoljeno da odgovarate na ovu ponudu' });
        }
      }
    }
if(idVezanePonude==""){
  idVezanePonude=null;
}
    const novaPonuda = await Ponuda.create({
      tekst,
      cijenaPonude: ponudaCijene,
      datumPonude,
      vezanaPonudaId: idVezanePonude,
      odbijenaPonuda,
      NekretninaId: nek.id,
      KorisnikId: user.id
    });

    res.status(201).json(novaPonuda);
  } catch (error) {
    console.error('Greška prilikom kreiranja ponude:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

















// Nova POST /nekretnina/:id/zahtjev ruta
app.post('/nekretnina/:id/zahtjev', async (req, res) => {
  try {
    const { tekst, trazeniDatum } = req.body;
    
    if (!req.session.userId) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    if (new Date(trazeniDatum) <= new Date()) {
      return res.status(404).json({ greska: 'Neispravan datum' });
    }

    const nekretnina = await Nekretnina.findByPk(req.params.id);
    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    }

    const zahtjev = await Zahtjev.create({
      tekst,
      trazeniDatum,
      odobren: null,
      NekretninaId: nekretnina.id,
      KorisnikId: req.session.userId
    });

    
    res.json(zahtjev);
  } catch (error) {
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});


















// Nova PUT /nekretnina/:id/zahtjev/:zid ruta
app.put('/nekretnina/:id/zahtjev/:zid', async (req, res) => {
  try {
    const { odobren, addToTekst } = req.body;
    
    if (!req.session.isAdmin) {
      return res.status(403).json({ greska: 'Samo admin može odgovoriti na zahtjev' });
    }

    if (!odobren && !addToTekst) {
      return res.status(400).json({ greska: 'Tekst odgovora je obavezan kada se odbija zahtjev' });
    }

    const zahtjev = await Zahtjev.findOne({
      where: {
        id: req.params.zid,
        NekretninaId: req.params.id
      }
    });

    if (!zahtjev) {
      return res.status(404).json({ greska: 'Zahtjev nije pronađen' });
    }

    zahtjev.odobren = odobren;
    if (addToTekst) {
      zahtjev.tekst = `${zahtjev.tekst}\n  ODGOVOR ADMINA: ${addToTekst}`;
    }

    await zahtjev.save();
    res.json(zahtjev);
  } catch (error) {
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});