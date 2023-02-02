const db = require("../../../config/db");
const { calculateWinnings } = require("../../../functions/index");

const drawController = {

    //Get all draw numbers
    index: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;


            const drawNumbers = await db.raw(`SELECT SQL_CALC_FOUND_ROWS * FROM machineNumbers
                                    ORDER BY id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`)

            const [total] = await db.raw('SELECT FOUND_ROWS() as total');


            return res.status(200).send({
                data: drawNumbers[0],
                page,
                pageSize,
                totalRecords: total[0].total
            });
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Save draw numbers
    create: async (req, res) => {
        const { drawNumbers, date } = req.body;
        if (drawNumbers.length !== 5) return res.status(400).send('Draw numbers must be up to 5 numbers');

        try {

            await db('machineNumbers').insert({
                drawDate: date ? date : new Date(),
                numbers: JSON.stringify(drawNumbers)
            })
            return res.status(200).end();

        }catch (e) {
            if (e.code === 'ER_DUP_ENTRY') return res.status(400).send('You have already entered Draw numbers for this Date');
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //delete draw
    destroy: async (req, res) => {
        try {
            await db('machineNumbers').where('id', req.body.id).del();
            return res.status(200).end();
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },





    //Perform Draw
    performDraw: async (req, res) => {
        const { id } = req.body;
        try {

            await db.transaction(async trx => {

            //query draw numbers
            const queryDrawNumbers = await trx('machineNumbers').where({id}).limit(1);

            //if draw numbers not found
            if (!queryDrawNumbers.length) return res.status(400).send("Sorry selected draw was not found");
            //if draw closed
            if (queryDrawNumbers[0].closed) return res.status(400).send("Sorry draw is closed already");

            let drawNumbers = JSON.parse(queryDrawNumbers[0].numbers);

            //query draw tickets
            const tickets = await trx('tickets')
                .where({ticketDate: queryDrawNumbers[0].drawDate})
                .select('id as ticketId', 'userId',
                    'numbers', 'amount', 'ticketDate');

            //If no tickets were found
            if (!tickets.length){
                await trx('machineNumbers').where({id}).update({closed: true});
                return res.status(200).end();
            }

            //map and convert ticket numbers to javascript array
            tickets.map(ticket => {
                return ticket.numbers = JSON.parse(ticket.numbers);
            })

                //declare winning numbers array
                const winners = [];

                for (let ticket of tickets){

                    //Find Matching numbers
                    let numbersInDrawNumber = ticket.numbers.filter(number => drawNumbers.includes(number));

                         //If 2 or more numbers found
                    if (numbersInDrawNumber.length > 1){
                        ticket.amountWon = calculateWinnings(numbersInDrawNumber.length, ticket.amount);
                        ticket.createdAt = new Date();
                        ticket.numbers = JSON.stringify(ticket.numbers);
                        delete ticket.amount;
                        winners.push(ticket)
                    }

                }


                //this will contain all ticket ids
                const ids = [];
                for (let ticket of tickets){
                    ids.push(ticket.ticketId);
                }

                //batch insert into winnings table
                await trx.batchInsert('winners', winners, 30);

                //Update all ticket status to closed
                await trx('tickets').whereIn('id', ids)
                    .update({ticketStatus: 'closed'});

                //close draw
                await trx('machineNumbers').where({id}).update({closed: true});


            return res.status(200).end();

            })
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }
}


module.exports = drawController