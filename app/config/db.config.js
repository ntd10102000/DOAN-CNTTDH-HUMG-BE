module.exports = {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: "nguyentienduong1",
    DB: "qly_sv",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};