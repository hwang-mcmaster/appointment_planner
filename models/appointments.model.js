const db = require('./db')

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
                status TEXT NOT NULL
            )
        `)

        db.get(`SELECT COUNT(*) AS count FROM appointments`, (err, row) => {
            if (err) return

            if (row.count === 0) {
                const stmt = db.prepare(`
                    INSERT INTO appointments
                    (title, description, date, start_time, end_time, location_name, location_address, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `)

                stmt.run(
                    'Team Meeting',
                    'Weekly sync',
                    '2026-02-10',
                    '14:00',
                    '15:00',
                    'Campus',
                    '1280 Main St',
                    'Upcoming'
                )

                stmt.run(
                    'Doctor Visit',
                    'Checkup',
                    '2026-01-20',
                    '09:00',
                    '10:00',
                    'Clinic',
                    '55 King St',
                    'Past'
                )

                stmt.finalize()
            }
        })
    })
}

function getAll(filter, sort, q, cb) {
    const whereParts = []
    const params = []

    if (filter === 'Upcoming' || filter === 'Past') {
        whereParts.push('status = ?')
        params.push(filter)
    }

    const query = (q || '').trim()
    if (query.length > 0) {
        whereParts.push('title LIKE ?')
        params.push(`%${query}%`)
    }

    const where = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

    let orderBy = 'date ASC, start_time ASC'
    if (sort === 'title') orderBy = 'title ASC'
    if (sort === 'status') orderBy = 'status ASC, date ASC, start_time ASC'

    const sql = `SELECT * FROM appointments ${where} ORDER BY ${orderBy}`
    db.all(sql, params, (err, rows) => cb(err, rows))
}

function getById(id, cb) {
    db.get(
        `SELECT * FROM appointments WHERE id = ?`,
        [id],
        (err, row) => cb(err, row)
    )
}

function create(appt, cb) {
    db.run(
        `
        INSERT INTO appointments
        (title, description, date, start_time, end_time, location_name, location_address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            appt.title,
            appt.description,
            appt.date,
            appt.start_time,
            appt.end_time,
            appt.location_name,
            appt.location_address,
            appt.status
        ],
        function (err) {
            cb(err, this ? this.lastID : null)
        }
    )
}

function deleteById(id, cb) {
    db.run(
        `DELETE FROM appointments WHERE id = ?`,
        [id],
        function (err) {
            cb(err, this ? this.changes : 0)
        }
    )
}

function updateById(id, appt, cb) {
    db.run(
        `
        UPDATE appointments
        SET title = ?,
            description = ?,
            date = ?,
            start_time = ?,
            end_time = ?,
            location_name = ?,
            location_address = ?,
            status = ?
        WHERE id = ?
        `,
        [
            appt.title,
            appt.description,
            appt.date,
            appt.start_time,
            appt.end_time,
            appt.location_name,
            appt.location_address,
            appt.status,
            id
        ],
        function (err) {
            cb(err, this ? this.changes : 0)
        }
    )
}

module.exports = {
    init,
    getAll,
    getById,
    create,
    deleteById,
    updateById
}