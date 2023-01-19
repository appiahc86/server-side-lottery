const db = require("../config/db");

const MachineNumber = async () => {
    if (!await db.schema.hasTable('machineNumbers')){

        await db.schema.createTable('machineNumbers', table => {
            table.increments('id').primary();
            table.date('drawDate').unique().notNullable();
            table.json('numbers').notNullable();
            table.boolean('closed').defaultTo(false);
        });

    }



}

module.exports = MachineNumber;