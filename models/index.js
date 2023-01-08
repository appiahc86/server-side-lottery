const User = require("./User");
const Ticket = require("./Ticket");
const MachineNumber = require("./MachineNumber");
// const Winners = require("./Winners");
const Transaction = require("./Transaction");


const migrations =  [
    User, Ticket, MachineNumber, Transaction
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;