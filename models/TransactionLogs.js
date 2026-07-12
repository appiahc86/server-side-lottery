const db = require("../config/db");

const TransactionLogs = async () => {
    if (!await db.schema.hasTable('transaction_logs')){

        await db.schema.createTable('transaction_logs', table => {
            table.bigIncrements('id').primary();
            table.bigInteger('userId').unsigned().notNullable();
            table.enum('type', ['deposit', 'withdrawal', 'stake','winnings','admin_adjustment','reversal']).notNullable();
            table.decimal('amount', 14,2).notNullable();
            table.decimal('oldBalance',14,2).notNullable();
            table.decimal('newBalance',14,2).notNullable();
            table.string('transaction_id').unique();
            table.string('description').nullable();
            table.timestamps(true, true);
            table.engine('InnoDB');


            table.index(['userId', 'created_at']); // fast "user's history" queries

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');

        });


    }



}

module.exports = TransactionLogs;