const db = require('../../config/db');

const testProcedure =  () => {
    db.raw(`
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS add_user (
  IN p_phone VARCHAR(15),
  IN p_network enum('mtn', 'vodafone', 'airtelTigo'),
  IN p_password VARCHAR(255),
  IN p_specialCode INT
)
BEGIN
  INSERT INTO users (phone, network, password, specialCode) 
  VALUES (p_phone, p_network, p_password, p_specialCode);
END//

DELIMITER ;
`)
        .then(() => {
            console.log('procedure created!');
        })
        .catch((error) => {
            console.error(error);
        });
}


module.exports = {
    testProcedure
}