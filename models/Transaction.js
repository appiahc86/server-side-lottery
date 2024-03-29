const db = require("../config/db");

const Transaction = async () => {
    if (!await db.schema.hasTable('transactions')){

        await db.schema.createTable('transactions', table => {
            table.bigIncrements('id').primary();
            table.string('referenceNumber').unique().notNullable().index();
            table.bigInteger('userId').unsigned().notNullable().index();
            table.enum('transactionType', ['withdrawal','deposit']).notNullable();
            table.float('amount').notNullable();
            table.enum('network', ['mtn','vodafone','airtelTigo']).notNullable();
            table.enum('status', ['pending', 'successful', 'failed']).defaultTo('pending');
            table.date('transactionDate').index().notNullable();
            table.dateTime('createdAt');
            table.engine('InnoDB');

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

        });


    }



}

module.exports = Transaction;