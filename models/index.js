const User = require("./User");
const Ticket = require("./Ticket");
const MachineNumber = require("./MachineNumber");
const Winners = require("./Winners");


const migrations =  [
    User, Ticket, Winners, MachineNumber
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;