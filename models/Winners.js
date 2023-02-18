const db = require("../config/db");

const Winners = async () => {
    if (!await db.schema.hasTable('winners')){

        await db.schema.createTable('winners', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned();
            table.bigInteger('ticketId').unsigned().index();
            table.json('numbers').notNullable();
            table.decimal('amountWon').notNullable();
            table.date('ticketDate').notNullable().index();
            table.dateTime('createdAt');
            table.engine('InnoDB')

            table.foreign('ticketId').references('id').inTable('tickets').onDelete('CASCADE');

        });


    }



}

module.exports = Winners;