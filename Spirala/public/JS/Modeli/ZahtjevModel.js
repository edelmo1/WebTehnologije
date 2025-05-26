const Sequelize = require("sequelize");


module.exports = function (sequelize, DataTypes) {

  const Zahtjev = sequelize.define('Zahtjev', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tekst: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    trazeniDatum: {
      type: Sequelize.DATE,
      allowNull: false
    },
    odobren: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });
  

return Zahtjev;
}
