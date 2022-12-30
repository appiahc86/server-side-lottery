const db = require("../config/db");

const User = async () => {
    if (!await db.schema.hasTable('users')){

        await db.schema.createTable('users', table => {
            table.increments('id').primary();
            table.string('firstName', 20);
            table.string('lastName', 20);
            table.string('phone', 15).unique();
            table.double('balance').defaultTo(0);
            table.string('password').notNullable();
            table.mediumint('specialCode').notNullable(); //will use in JWT compare
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');
        });

        // insert User if none exists
        // await db('users').insert(
        //     {
        //         firstName: "Appiah",
        //         phone: 242740320,
        //         networkType: 'mtn',
        //         password: "$2a$10$N9sVJn6Nwxtm.PUmbRXLzOFNZfRAjTjNK3EfFu2qRjpnNHQrCbd6i" //@LogMeIn
        //     }
        // );
    }



}

module.exports = User;