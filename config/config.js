
if (process.env.NODE_ENV !== 'production'){
    module.exports = {
        DB_HOST: "127.0.0.1",
        DB_USER: "root",
        DB_PASS: "",
        DB_NAME: "nanty",
        JWT_SECRET: "&#2022Dec",
        SMS_API_KEY: "b5526f29eea2877d0294ac6a447662865d07",
        SMS_SENDER: "Nanty",
        PAYSTACK_SECRET_KEY: "sk_test_a0763ec0345c4c759bff26d5fe12f8bec6b323a4",
        PAYMENT_EMAIL: "wsappiah@gmail.com"
    };
}else { //In production
    module.exports = {
    DB_HOST: "127.0.0.1",
    DB_USER: "nantwvtm_whynot",
    DB_PASS: "@%x0MhpAB}s5",
    DB_NAME: "nantwvtm_nanty",
    JWT_SECRET: "&#2022Dec",
    SMS_API_KEY: "b5526f29eea2877d0294ac6a447662865d07",
    SMS_SENDER: "Nanty",
    PAYSTACK_SECRET_KEY: "sk_test_a0763ec0345c4c759bff26d5fe12f8bec6b323a4",
    PAYMENT_EMAIL: "wsappiah@gmail.com"
}

}
