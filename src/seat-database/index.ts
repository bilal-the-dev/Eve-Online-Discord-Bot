import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: process.env.SEAT_DB_HOST,
  user: process.env.SEAT_DB_USER,
  password: process.env.SEAT_DB_PASS,
  port: Number(process.env.SEAT_DB_PORT),
});

export default pool;
