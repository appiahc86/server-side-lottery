const db = require("../config/db");

const Image = async () => {
    if (!await db.schema.hasTable('images')){

        await db.schema.createTable('images', table => {
            table.increments('id').primary();
            table.json('list');
            table.engine('InnoDB');
        });

        await db('images').insert({list: JSON.stringify([])})
    }

}

module.exports = Image;