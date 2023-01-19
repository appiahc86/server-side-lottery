const db = require('../../config/db');

const winnersTrigger =  () => {
    db.raw(`
CREATE TRIGGER IF NOT EXISTS update_winners_balance_trigger
AFTER INSERT ON winners FOR EACH ROW
BEGIN
      UPDATE users
      SET balance = balance + NEW.amountWon
      WHERE id = New.userId;
END;
`)
        .then(() => {
            console.log('update_winners_balance_trigger created!');
        })
        .catch((error) => {
            console.error(error);
        });
}


module.exports = {
    winnersTrigger
}