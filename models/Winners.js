const db = require("../config/db");

const Winners = async () => {
    if (!await db.schema.hasTable('winners')){

        await db.schema.createTable('winners', table => {
            table.increments('id').primary();
            table.string('ticketId').index();
            table.float('amountWon').notNullable();
            table.json('winningNumbers').notNullable();
            table.timestamp('createdAt').defaultTo(db.fn.now());

            table.foreign('ticketId').references('id').inTable('tickets').onDelete('CASCADE');

        });


    }



}

module.exports = Winners;