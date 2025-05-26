const Sequelize = require('sequelize');
const sequelize = new Sequelize('wt24', 'root', '', {   //ostavio sam da je password prazan da bih mogao otvoriti bazu na mom laptopu
    host: '127.0.0.1',
    dialect: 'mysql',
    define :{freezeTableName:true }
});


module.exports = sequelize;