const db = require("../config/db");

const Winners = async () => {
    if (!await db.schema.hasTable('winners')){

        await db.schema.createTable('winners', table => {
            table.increments('id').primary();
            table.integer('userId').unsigned();
            table.integer('ticketId').unsigned().index();
            table.json('numbers').notNullable();
            table.decimal('amountWon').notNullable();
            table.date('ticketDate').notNullable().index();
            table.dateTime('createdAt');

            table.foreign('ticketId').references('id').inTable('tickets').onDelete('CASCADE');

        });


    }



}

module.exports = Winners;