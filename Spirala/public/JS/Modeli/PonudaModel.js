const Sequelize = require("sequelize");


module.exports = function (sequelize, DataTypes) {

  const Ponuda = sequelize.define('Ponuda', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tekst: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    cijenaPonude: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    datumPonude: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    odbijenaPonuda: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

return Ponuda;
}
