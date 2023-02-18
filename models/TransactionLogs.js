const db = require("../config/db");

const TransactionLogs = async () => {
    if (!await db.schema.hasTable('transactionLogs')){

        await db.schema.createTable('transactionLogs', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned().notNullable().index();
            table.enum('type', ['deposit', 'withdrawal', 'stake']).notNullable();
            table.decimal('amount').notNullable();
            table.decimal('oldBalance').notNullable();
            table.decimal('newBalance').notNullable();
            table.date('date').index();
            table.dateTime('createdAt');

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

        });


    }



}

module.exports = TransactionLogs;