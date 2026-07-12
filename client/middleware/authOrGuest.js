const jwt =  require("jsonwebtoken");
const db = require("../../config/db");
const config = require("../../config/config");
const logger = require("../../winston");




const authOrGuest = async (req, res, next) => {

    try{

        const token = req.header("Authorization").replace("Bearer ", "");


        //If User not logged in, continue with the request
        if(token === "Bearer") return next();


        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await db("users")
            .where({id: decoded.id})
            .select("id","phone",
                "balance", "network","specialCode")
            .limit(1);

        //If user not found
        if (!user.length)  return res.status(401).send("Please login");

        //if special code does not match
        if (parseInt(user[0].specialCode ) !== parseInt(decoded.specialCode))
            return res.status(401).send("Please login");

        req.token = token;
        req.user = user[0];
        next();
    }catch (e) {
        if(e.message === "invalid token") return res.status(401).send("Please login");
        logger.error(e)
        res.status(401).send("Please login");
    }
}


module.exports =  authOrGuest;