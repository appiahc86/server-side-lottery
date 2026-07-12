const db = require("../config/db");

const Winners = async () => {
    if (!await db.schema.hasTable('winners')){

        await db.schema.createTable('winners', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned();
            table.bigInteger('ticketId').unsigned();
            table.json('numbers').notNullable();
            table.decimal('amountWon', 14,2).notNullable();
            table.date('ticketDate').notNullable().index();
            table.dateTime('createdAt');
            table.engine('InnoDB')

            table.index("ticketId")
            table.index("userId", "createdAt")

            table.foreign('ticketId').references('id').inTable('tickets').onDelete('CASCADE');
            table.foreign('userId').references('id').inTable('users').onDelete('SET NULL');

        });


    }



}

module.exports = Winners;