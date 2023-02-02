const db = require('../../config/db');

//This trigger will fire when transaction status changes to successful, then update the user's account balance
const updateBalanceTrigger =  () => {
    db.raw(`
CREATE TRIGGER IF NOT EXISTS update_balance_trigger
AFTER UPDATE ON transactions FOR EACH ROW
BEGIN
  IF NEW.status = 'successful' AND OLD.status = 'pending' AND OLD.transactionType = 'deposit' THEN
      UPDATE users
      SET balance = balance + OLD.amount
      WHERE id = OLD.userId;
  ELSEIF NEW.status = 'failed' AND OLD.status = 'pending' AND OLD.transactionType = 'withdrawal' THEN
      UPDATE users
      SET balance = balance + OLD.amount
      WHERE id = OLD.userId;    
  END IF;
END;
`)
        .then(() => {
            console.log('update_balance_trigger created!');
        })
        .catch((error) => {
            console.error(error);
        });


}


module.exports = {
    updateBalanceTrigger
}