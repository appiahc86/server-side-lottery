const db = require('../../config/db');

//This trigger will fire when deposit transaction status changes to successful,
// then update the user's account balance
const depositTrigger =  () => {
    db.raw(`
CREATE TRIGGER IF NOT EXISTS deposit_trigger
AFTER INSERT ON transactions FOR EACH ROW
BEGIN
  IF NEW.status = 'successful' THEN
    UPDATE users
    SET balance = balance + NEW.amount
    WHERE id = NEW.userId;   
  END IF;
END;
`)
        .then(() => {
            console.log('deposit_trigger created!');
        })
        .catch((error) => {
            console.error(error);
        });


}


module.exports = {
    depositTrigger
}