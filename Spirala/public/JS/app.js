
const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./baza.js");

const UpitModel = require("./Modeli/UpitModel.js");
const ZahtjevModel = require("./Modeli/ZahtjevModel");
const PonudaModel = require("./Modeli/PonudaModel.js");
const KorisnikModel = require("./Modeli/KorisnikModel.js");
const NekretninaModel = require("./Modeli/NekretninaModel.js");
const veze = require("./Modeli/veze.js");
const initializeUsers = require("./korisnici.js");
console.log("Funkcija initializeUsers je importovana:", initializeUsers);



const app = express();
const Upit = UpitModel(sequelize);
const Zahtjev = ZahtjevModel(sequelize);
const Ponuda = PonudaModel(sequelize);
const Korisnik = KorisnikModel(sequelize);
const Nekretnina = NekretninaModel(sequelize);


app.use(bodyParser.json());

(async () => {
    try {
        await sequelize.sync({ alter: true }); // Sinhronizuje sve tabele

        // Poziv funkcije za inicijalizaciju korisnika
        await initializeUsers(Korisnik);
        console.log("Korisnici su inicijalizovani.");
    } catch (err) {
        console.error("Greška prilikom inicijalizacije baze ili korisnika:", err);
    }
})();
    
/*
Korisnik.sync();         //kreirali smo tabele iz modela
Upit.sync();
Ponuda.sync();
Zahtjev.sync();
Nekretnina.sync();
*/
