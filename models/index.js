const User = require("./User");
const Ticket = require("./Ticket");
const MachineNumber = require("./MachineNumber");
const Winners = require("./Winners");
const Image = require("./Image");
const Transaction = require("./Transaction");
const GameStatus = require("./GameStatus");
const AdminUser = require("./AdminUser");


const migrations =  [
    User, Ticket, MachineNumber, Transaction, Image, Winners, GameStatus, AdminUser
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;