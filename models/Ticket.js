const db = require("../config/db");

const Ticket = async () => {
    if (!await db.schema.hasTable('tickets')){

        await db.schema.createTable('tickets', table => {
            table.increments('id').primary();
            table.integer('userId').unsigned().notNullable();
            table.string('ticketId').notNullable();
            table.date('ticketDate').defaultTo(db.fn.now());
            table.json('numbers').notNullable();
            table.tinyint('day').unsigned().notNullable();  // 0 = sunday, 1 = monday ...
            table.enum('ticketStatus', ['open', 'closed']).defaultTo('open');
            table.float('amount').notNullable();
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

        });


    }



}

module.exports = Ticket;