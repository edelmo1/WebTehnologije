const Sequelize = require("sequelize");


module.exports = function (sequelize, DataTypes) {

  const Korisnik = sequelize.define('Korisnik', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ime: {
      type: Sequelize.STRING,
      allowNull: false
    },
    prezime: {
      type: Sequelize.STRING,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    admin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

return Korisnik;
}
