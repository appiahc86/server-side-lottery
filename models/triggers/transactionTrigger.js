const db = require('../../config/db');

const updateBalanceTrigger =  () => {

    db.raw(`
CREATE TRIGGER IF NOT EXISTS update_balance_trigger
AFTER UPDATE ON transactions FOR EACH ROW
BEGIN
  IF NEW.status = 'successful' AND OLD.transactionType = 'deposit' THEN
      UPDATE users
      SET balance = balance + OLD.amount
      WHERE id = OLD.userId;
  ELSEIF NEW.status = 'successful' AND OLD.transactionType = 'withdrawal' THEN
      UPDATE users
      SET balance = balance - OLD.amount
      WHERE id = OLD.userId;
  END IF;
END;
`)
        .then(() => {
            console.log('update_balance_trigger Trigger created!');
        })
        .catch((error) => {
            console.error(error);
        });


}


module.exports = {
    updateBalanceTrigger
}