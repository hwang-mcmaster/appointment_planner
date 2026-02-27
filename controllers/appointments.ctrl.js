const appointmentsModel = require('../models/appointments.model')

function showHome(req, res) {
    appointmentsModel.getAll((err, rows) => {
        if (err) {
            return res.status(500).send('Database error')
        }

        const selected = rows.length > 0 ? rows[0] : null

        res.render('index', {
            pageTitle: 'Simple Appointment Planner',
            appointments: rows,
            selected
        })
    })
}

function showById(req, res) {
    const id = Number(req.params.id)

    appointmentsModel.getAll((err, rows) => {
        if (err) {
            return res.status(500).send('Database error')
        }

        appointmentsModel.getById(id, (err2, selected) => {
            if (err2) {
                return res.status(500).send('Database error')
            }

            res.render('index', {
                pageTitle: 'Simple Appointment Planner',
                appointments: rows,
                selected
            })
        })
    })
}

module.exports = {
    showHome,
    showById
}