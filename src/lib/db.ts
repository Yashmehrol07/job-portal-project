import { createClient } from '@libsql/client';

let libsqlClient: any = null;

export async function getDb() {
    if (!libsqlClient) {
        // Fallback to local dev.db if no Turso URL is provided 
        const url = process.env.TURSO_DATABASE_URL?.trim() || 'file:./dev.db';
        const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

        libsqlClient = createClient({
            url: url,
            authToken: authToken
        });
    }

    // Proxy wrapper to maintain compatibility with existing sqlite3 syntax calls (.all, .get, .run)
    return {
        all: async (sql: string, params: any[] = []) => {
            const result = await libsqlClient.execute({ sql, args: params });
            // LibSQL returns rows as objects but occasionally nested values, normalize for our APIs
            return result.rows;
        },
        get: async (sql: string, params: any[] = []) => {
            const result = await libsqlClient.execute({ sql, args: params });
            return result.rows.length > 0 ? result.rows[0] : undefined;
        },
        run: async (sql: string, params: any[] = []) => {
            const result = await libsqlClient.execute({ sql, args: params });
            return { lastID: result.lastInsertRowid ? Number(result.lastInsertRowid) : 0, changes: result.rowsAffected };
        },
        exec: async (sql: string) => {
            await libsqlClient.executeMultiple(sql);
        }
    };
}

export default getDb;
