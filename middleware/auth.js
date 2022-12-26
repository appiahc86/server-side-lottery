const jwt =  require("jsonwebtoken");
const db = require("../config/db");
const config = require("../config/config");




const auth = async (req, res, next) => {

    try{

        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await db("users")
            .where({id: decoded.id})
            .select("id", "firstName", "lastName", "phone", "balance")
            .limit(1);

        if (!user.length) {
            return res.status(401).send("Please login");
        }

        req.token = token;
        req.user = user[0];
        next();
    }catch (e) {
        console.log("JWT Auth Error");
        res.status(401).send("Please login");
    }
}


module.exports =  auth;