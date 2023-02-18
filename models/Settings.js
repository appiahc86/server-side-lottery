const db = require("../config/db");

const Settings = async () => {
    if (!await db.schema.hasTable('settings')){

        await db.schema.createTable('settings', table => {
            table.increments('id').primary()
            table.boolean('gameStatus').defaultTo(true);
            table.boolean('deposits').defaultTo(true);
            table.boolean('withdrawals').defaultTo(true);
            table.engine('InnoDB');
        });

        await db("settings").insert({});


    }



}

module.exports = Settings;