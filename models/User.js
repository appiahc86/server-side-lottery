const db = require("../config/db");

const User = async () => {
    if (!await db.schema.hasTable('users')){

        await db.schema.createTable('users', table => {
            table.increments('id').primary();
            table.string('firstName', 20);
            table.string('lastName', 20);
            table.string('phone', 15).unique();
            table.enum('networkType', ['mtn','vodafone','airtelTigo']);
            table.float('balance').defaultTo(0);
            table.string('password').notNullable();
            table.boolean('isActive').defaultTo(true);
            table.boolean('resetPassword').defaultTo(false);
            table.datetime('tokenExp').nullable();
            table.timestamp('createdAt').defaultTo(db.fn.now());
        });

        // insert User if none exists
        await db('users').insert(
            {
                firstName: "Appiah",
                phone: 242740320,
                networkType: 'mtn',
                password: "$2a$10$N9sVJn6Nwxtm.PUmbRXLzOFNZfRAjTjNK3EfFu2qRjpnNHQrCbd6i" //@LogMeIn
            }
        );

    }



}

module.exports = User;