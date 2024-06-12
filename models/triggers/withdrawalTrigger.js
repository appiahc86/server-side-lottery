const db = require('../../config/db');

//This trigger will fire when withdrawal transaction status changes to successful,
// then update the user's account balance
const withdrawalTrigger =  () => {
    db.raw(`
CREATE TRIGGER IF NOT EXISTS withdrawal_trigger
AFTER UPDATE ON transactions FOR EACH ROW
BEGIN
  IF NEW.status = 'successful' AND OLD.status = 'pending' AND OLD.transactionType = 'withdrawal' THEN
      UPDATE users
      SET balance = balance - OLD.amount
      WHERE id = OLD.userId;   
      
      ELSEIF NEW.status = 'failed' AND OLD.status = 'pending' AND OLD.transactionType = 'withdrawal' THEN 
      UPDATE users
      SET balance = balance
      WHERE id = OLD.userId;
      
  END IF;
END;
`)
        .then(() => {
            console.log('withdrawal_trigger created!');
        })
        .catch((error) => {
            console.error(error);
        });


}


module.exports = {
    withdrawalTrigger
}