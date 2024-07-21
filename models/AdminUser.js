const db = require("../config/db");

const AdminUser = async () => {
    if (!await db.schema.hasTable('admin_users')){

        await db.schema.createTable('admin_users', table => {
            table.increments('id').primary();
            table.string('displayName', 10).notNullable();
            table.string('phone', 15).unique();
            table.tinyint('role').defaultTo(2);
            table.mediumint('specialCode').notNullable();
            table.string('password').notNullable(); //will use in JWT compare
            table.string('passwordResetCode', 10);
            table.boolean('isActive').defaultTo(true);
            table.timestamp('createdAt').defaultTo(db.fn.now());
            table.engine('InnoDB');
        });


        await db('admin_users').insert(
            {
                displayName: "Daniel",
                phone: "550452587",
                role: 1,
                specialCode: 202020,
                password: "$2a$10$8MC2cf.XyGEMp0w0Ndt5bO1FMrFW4Y1Vtf.YCtj2ZupS1M1u.lFb2",
                isActive: true,
                createdAt: new Date()
            }
        );
    }



}

module.exports = AdminUser;