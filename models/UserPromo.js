const db = require("../config/db");

const UserPromo = async () => {
    if (!await db.schema.hasTable('userPromos')){

        await db.schema.createTable('userPromos', table => {
            table.increments('id').primary();
            table.bigInteger('promoId').unsigned().notNullable().index();
            table.bigInteger('userId').unsigned().notNullable().index();
            table.float('amount').defaultTo(0);
            table.boolean('active').defaultTo(0);
            table.engine('InnoDB');

            table.foreign('promoId').references('id').inTable('promotions').onDelete('CASCADE');
            table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
        });

    }



}

module.exports = UserPromo;