const User = require("./User");
const Ticket = require("./Ticket");
const MachineNumber = require("./MachineNumber");
const Winners = require("./Winners");
const Image = require("./Image");
const Transaction = require("./Transaction");
const Settings = require("./Settings");
const AdminUser = require("./AdminUser");
const TransactionLogs = require("./TransactionLogs");


const migrations =  [
    User, Ticket, MachineNumber, Transaction, Image, Winners, Settings, AdminUser, TransactionLogs
]

  const runMigrations = async () => {

    for (const migration of migrations) {
        await migration();
    }

      console.log('Database Connected')
  }

 module.exports = runMigrations;