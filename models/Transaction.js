const db = require("../config/db");

const Transaction = async () => {
    if (!await db.schema.hasTable('transactions')){

        await db.schema.createTable('transactions', table => {
            table.bigIncrements('id').primary();
            table.string('referenceNumber').unique().notNullable(); //my own reference
            table.string('extReferenceNumber').unique().notNullable(); //external reference
            table.bigInteger('userId').unsigned().notNullable();
            table.enum('transactionType', ['withdrawal','deposit']).notNullable();
            table.decimal('amount', 14,2).notNullable();
            table.decimal('chargesAmount', 14, 2).nullable(); //fee, from callback
            table.decimal('amountAfterCharges', 14, 2).nullable();
            table.enum('status', ['pending', 'success', 'failed',  'cancelled', 'reversed']).defaultTo('pending');
            table.timestamps(true, true);
            table.engine('InnoDB');

            //indices
            table.index('userId');
            table.index('referenceNumber');
            table.index('created_at');
            table.index(['userId', 'status', 'transactionType']);
            table.index(['status','transactionType', 'created_at'])

            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
        });
    }


}

module.exports = Transaction;