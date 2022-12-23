const db = require("../config/db");

const MachineNumber = async () => {
    if (!await db.schema.hasTable('machineNumbers')){

        await db.schema.createTable('machineNumbers', table => {
            table.increments('id').primary();
            table.date('drawDate').defaultTo(db.fn.now());
            table.json('numbers').notNullable();
            table.boolean('closed')
            table.timestamp('createdAt').defaultTo(db.fn.now());
        });

    }



}

module.exports = MachineNumber;