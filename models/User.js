const db = require("../config/db");

const User = async () => {
    if (!await db.schema.hasTable('users')){

        await db.schema.createTable('users', table => {
            table.increments('id').primary();
            table.string('phone', 15).unique();
            table.enum('network', ['mtn', 'vodafone', 'airtelTigo']).notNullable();
            table.decimal('balance').defaultTo(0).unsigned();
            table.string('password').notNullable();
            table.string('passwordResetCode', 10);
            table.mediumint('specialCode').notNullable(); //will use in JWT compare
            table.string('recipientCode').nullable();
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
        });


    }



}

module.exports = User;