const Sequelize = require("sequelize");


module.exports = function (sequelize, DataTypes) {

  const Nekretnina = sequelize.define('Nekretnina', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tip_nekretnine: {
      type: Sequelize.STRING,
      allowNull: false
    },
    naziv: {
      type: Sequelize.STRING,
      allowNull: false
    },
    kvadratura: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    cijena: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    tip_grijanja: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lokacija: {
      type: Sequelize.STRING,
      allowNull: false
    },
    godina_izgradnje: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    datum_objave: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    opis: {
      type: Sequelize.TEXT,
      allowNull: true
    }
    
  });


//Interesovanja-svi povezani upiti,zahtjevi,ponude
  Nekretnina.prototype.getInteresovanja = async function () {
    const upiti = await this.getUpits(); // Sequelize automatski kreira metodu getUpits
    const zahtjevi = await this.getZahtjevs(); // Sequelize automatski kreira metodu getZahtjevs
    const ponude = await this.getPonudas(); // Sequelize automatski kreira metodu getPonudas

    // Kombinuj sve rezultate u jednu listu i vrati
    return [...upiti, ...zahtjevi, ...ponude];
  };


return Nekretnina;
}
