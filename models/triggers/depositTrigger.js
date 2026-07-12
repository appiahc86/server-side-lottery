const db = require('../../config/db');

//This trigger will fire when deposit transaction status changes to successful,
// then update the user's account balance
const depositTrigger =  () => {
    db.raw(`
CREATE TRIGGER IF NOT EXISTS after_deposit_trigger
AFTER UPDATE ON transactions FOR EACH ROW
BEGIN
  IF NEW.status = 'success' AND OLD.status = 'pending' AND OLD.transactionType = 'deposit' THEN
    UPDATE users
    SET balance = balance + NEW.amount
    WHERE id = NEW.userId;   
  END IF;
END;
`)
        .then(() => {
            console.log('after_deposit_trigger created!');
        })
        .catch((error) => {
            console.error(error);
        });


}


module.exports = {
    depositTrigger
}