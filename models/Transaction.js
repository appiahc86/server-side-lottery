const db = require("../config/db");

const Transaction = async () => {
    if (!await db.schema.hasTable('transactions')){

        await db.schema.createTable('transactions', table => {
            table.bigIncrements('id').primary();
            table.string('referenceNumber').unique().notNullable().index();
            table.bigInteger('userId').unsigned().notNullable();
            table.enum('transactionType', ['withdrawal','deposit']).index().notNullable();
            table.float('amount').notNullable();
            table.enum('status', ['pending', 'successful', 'failed']).index().defaultTo('pending');
            table.date('transactionDate').index().notNullable();
            table.dateTime('createdAt');
            //TODO add approved or declined date
            table.engine('InnoDB');

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
        });
    }


}

module.exports = Transaction;