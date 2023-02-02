const db = require("../config/db");

const GameStatus = async () => {
    if (!await db.schema.hasTable('gameStatus')){

        await db.schema.createTable('gameStatus', table => {
            table.increments('id').primary();
          table.boolean('open').defaultTo(true);
        });

        await db('gameStatus').insert({open: true});
    }

}

module.exports = GameStatus;