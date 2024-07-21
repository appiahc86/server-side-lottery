const db = require("../config/db");

const MachineNumber = async () => {
    if (!await db.schema.hasTable('machine_numbers')){

        await db.schema.createTable('machine_numbers', table => {
            table.increments('id').primary();
            table.date('drawDate').unique().notNullable();
            table.json('numbers').notNullable();
            table.json('machineNumbers');
            table.boolean('closed').defaultTo(false);
            table.engine('InnoDB');
        });

    }



}

module.exports = MachineNumber;