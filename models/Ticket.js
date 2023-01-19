const db = require("../config/db");

const Ticket = async () => {
    if (!await db.schema.hasTable('tickets')){

        await db.schema.createTable('tickets', table => {
            table.increments('id').primary();
            table.integer('userId').unsigned().notNullable().index();
            table.json('numbers').notNullable();
            table.enum('ticketStatus', ['open', 'closed']).defaultTo('open');
            table.float('amount').notNullable();
            table.date('ticketDate').index();
            table.dateTime('createdAt');

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

        });


    }



}

module.exports = Ticket;