
if (process.env.NODE_ENV !== 'production'){
    module.exports = {
        DB_HOST: "127.0.0.1",
        DB_USER: "root",
        DB_PASS: "",
        DB_NAME: "dat",
        JWT_SECRET: "",
        SMS_API_KEY: "",
        SMS_SENDER: "",
        SMS_NUMBER: "",
        PAYMENT_API_KEY: "",
        CALLBACK_URL: "k",
        PAYMENT_CHARGE_PERCENTAGE: 0,
    };
}else { //In production
    module.exports = {
        DB_HOST: "127.0.0.1",
        DB_USER: "root",
        DB_PASS: "",
        DB_NAME: "dat",
        JWT_SECRET: "",
        SMS_API_KEY: "",
        SMS_SENDER: "",
        SMS_NUMBER: "",
        PAYMENT_API_KEY: "",
        CALLBACK_URL: "k",
        PAYMENT_CHARGE_PERCENTAGE: 0,
    }

}
s = config;