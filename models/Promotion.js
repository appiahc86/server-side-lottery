const db = require("../config/db");
const moment = require("moment");

const Promotion = async () => {
    if (!await db.schema.hasTable('promotions')){

        await db.schema.createTable('promotions', table => {
            table.bigIncrements('id').primary();
            table.string('name');
            table.string('image');
            table.text('description');
            table.date('startDate').index();
            table.date('endDate').index();
            table.engine('InnoDB');
        });

    }


    await db('promotions').insert({
        name: 'First Deposit',
        description: 'Fist deposit promo',
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().add(10, 'years').format("YYYY-MM-DD"),
    })

}

module.exports = Promotion;