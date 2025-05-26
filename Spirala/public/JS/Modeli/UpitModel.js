const Sequelize = require("sequelize");


module.exports = function (sequelize, DataTypes) {

  const Upit = sequelize.define('Upit', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tekst: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  });

return Upit;
}
