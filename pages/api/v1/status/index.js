import database from "infra/database.js"

async function status(request, response) {
    const updatedAt = new Date().toISOString();

    const databaseName = process.env.POSTGRES_DB;
    const result = await database.query({
        text: `
            SELECT 
                current_setting('server_version') AS version,
                current_setting('max_connections') AS max_connections,
                count(*) AS connections_used
            FROM pg_stat_activity 
            WHERE datname = $1`,
        values: [databaseName],
    });
    const databaseVersion = result.rows[0].version;
    const databaseMaxConnections = result.rows[0].max_connections;
    const databaseOpenedConnections = result.rows[0].connections_used;

    response.status(200).json({
        updated_at: updatedAt,
        dependencies: {
            database: {
                version: databaseVersion,
                max_connections: parseInt(databaseMaxConnections),
                opened_connections: parseInt(databaseOpenedConnections),
            }
        }
    })

}

export default status