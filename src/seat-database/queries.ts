import pool from "./index.js";

export const getEveToken = async (): Promise<{ token: string }> => {
  let conn;
  try {
    conn = await pool.getConnection();

    const result = await conn.query(
      `SELECT * FROM refresh_tokens WHERE user_id = 7`
    ); // get token of the corporation owner

    await conn.release();
    return result[0];
  } catch (error) {
    console.log(error);

    await conn?.release();
    throw new Error("Something went wrong");
  }
};
