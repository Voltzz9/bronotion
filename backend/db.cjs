// backend/db
import { Pool } from 'pg';

const pool = new Pool({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'bronotion', 
    port: 5432,  // PostgreSQL port
});

export default pool;
