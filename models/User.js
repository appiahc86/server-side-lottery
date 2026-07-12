const db = require("../config/db");

const User = async () => {
    if (!await db.schema.hasTable('users')){

        await db.schema.createTable('users', table => {
            table.bigIncrements('id').primary();
            table.string('phone', 15).unique();
            table.string('name').defaultTo("");
            table.enum('network', ['mtn', 'telecel', 'airtelTigo']).notNullable();
            table.decimal('balance', 14,2).defaultTo(0.00);
            table.string('password').notNullable();
            table.string('passwordResetCode', 10);
            table.mediumint('specialCode').notNullable(); //will use in JWT compare
            table.boolean('isActive').defaultTo(true);
            table.timestamps(true, true);
            table.engine('InnoDB');
        });


    }



}

module.exports = User;