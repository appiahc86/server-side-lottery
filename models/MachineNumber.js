const db = require("../config/db");

const MachineNumber = async () => {
    if (!await db.schema.hasTable('machineNumbers')){

        await db.schema.createTable('machineNumbers', table => {
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