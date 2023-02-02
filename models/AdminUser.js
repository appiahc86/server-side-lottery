const db = require("../config/db");

const AdminUser = async () => {
    if (!await db.schema.hasTable('adminUsers')){

        await db.schema.createTable('adminUsers', table => {
            table.increments('id').primary();
            table.string('displayName', 10).notNullable();
            table.string('phone', 15).unique();
            table.tinyint('role').defaultTo(2);
            table.mediumint('specialCode').notNullable();
            table.string('password').notNullable(); //will use in JWT compare
            table.string('passwordResetCode', 10);
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
        });


        await db('adminUsers').insert(
            {
                displayName: "Daniel",
                phone: "550452587",
                role: 1,
                specialCode: 202020,
                password: "$2a$10$dPgEuIaehK8e4ze7J.t1u.coxsBnmaVEhZykijojV5DmD8NYLh87q",
                isActive: true,
                createdAt: new Date()
            }
        );
    }



}

module.exports = AdminUser;