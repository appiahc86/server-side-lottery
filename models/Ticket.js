const db = require("../config/db");

const Ticket = async () => {
    if (!await db.schema.hasTable('tickets')){

        await db.schema.createTable('tickets', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned().notNullable().index();
            table.json('numbers').index().notNullable();
            table.enum('ticketStatus', ['open', 'closed']).defaultTo('open');
            table.float('amount').notNullable();
            table.float('payable').notNullable();
            table.date('ticketDate').index();
            table.dateTime('createdAt');
            table.engine('InnoDB');

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

        });


    }



}

module.exports = Ticket;