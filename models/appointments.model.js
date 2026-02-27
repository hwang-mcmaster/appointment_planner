const db = require('./db');

function init() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                location_name TEXT,
                location_address TEXT,
                latitude REAL,
                longitude REAL,
                status TEXT NOT NULL
            )
        `);

        db.get(`SELECT COUNT(*) AS count FROM appointments`, (err, row) => {
            if (err) return;

            if (row.count === 0) {
                const stmt = db.prepare(`
                    INSERT INTO appointments
                    (title, description, date, start_time, end_time, location_name, location_address, latitude, longitude, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

                stmt.run(
                    'Team Meeting',
                    'Weekly sync',
                    '2026-02-10',
                    '14:00',
                    '15:00',
                    'Campus',
                    '1280 Main St',
                    43.2609,
                    -79.9192,
                    'Upcoming'
                );

                stmt.run(
                    'Doctor Visit',
                    'Checkup',
                    '2026-01-20',
                    '09:00',
                    '10:00',
                    'Clinic',
                    '55 King St',
                    43.2557,
                    -79.8711,
                    'Past'
                );

                stmt.finalize();
            }
        });
    });
}

function getAll(cb) {
    db.all(
        `SELECT * FROM appointments ORDER BY date ASC, start_time ASC`,
        (err, rows) => cb(err, rows)
    );
}

function getById(id, cb) {
    db.get(
        `SELECT * FROM appointments WHERE id = ?`,
        [id],
        (err, row) => cb(err, row)
    );
}

module.exports = {
    init,
    getAll,
    getById
};