const appointmentsModel = require('../models/appointments.model');

function validateAppointment(body) {
    const errors = {};

    const title = (body.title || '').trim();
    const date = (body.date || '').trim();
    const start_time = (body.start_time || '').trim();
    const end_time = (body.end_time || '').trim();

    const latitude = body.latitude === '' || body.latitude === undefined ? null : Number(body.latitude);
    const longitude = body.longitude === '' || body.longitude === undefined ? null : Number(body.longitude);

    if (title.length < 2) errors.title = 'Title must be at least 2 characters';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = 'Date must be in YYYY-MM-DD format';
    if (!/^\d{2}:\d{2}$/.test(start_time)) errors.start_time = 'Start time must be in HH:MM format';
    if (!/^\d{2}:\d{2}$/.test(end_time)) errors.end_time = 'End time must be in HH:MM format';

    if (!errors.start_time && !errors.end_time) {
        if (end_time <= start_time) errors.time = 'End time must be later than start time';
    }

    const hasLat = body.latitude !== '' && body.latitude !== undefined;
    const hasLng = body.longitude !== '' && body.longitude !== undefined;

    if (hasLat || hasLng) {
        if (!hasLat || !hasLng) {
            errors.coords = 'Latitude and longitude must both be provided';
        } else {
            if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) errors.latitude = 'Latitude must be between -90 and 90';
            if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) errors.longitude = 'Longitude must be between -180 and 180';
        }
    }

    return errors;
}

function defaultForm() {
    return {
        title: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        location_name: '',
        location_address: '',
        latitude: '',
        longitude: '',
        status: 'Upcoming',
        formStatusUpcoming: true,
        formStatusPast: false
    };
}

function showHome(req, res) {
    appointmentsModel.getAll((err, rows) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        const selected = rows.length > 0 ? rows[0] : null;

        res.render('index', {
            pageTitle: 'Simple Appointment Planner',
            appointments: rows,
            selected,
            form: defaultForm(),
            errors: {}
        });
    });
}

function showById(req, res) {
    const id = Number(req.params.id);

    appointmentsModel.getAll((err, rows) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        appointmentsModel.getById(id, (err2, selected) => {
            if (err2) {
                return res.status(500).send('Database error');
            }

            res.render('index', {
                pageTitle: 'Simple Appointment Planner',
                appointments: rows,
                selected,
                form: defaultForm(),
                errors: {}
            });
        });
    });
}

function createAppointment(req, res) {
    const errors = validateAppointment(req.body);

    const form = {
        title: (req.body.title || '').trim(),
        description: (req.body.description || '').trim(),
        date: (req.body.date || '').trim(),
        start_time: (req.body.start_time || '').trim(),
        end_time: (req.body.end_time || '').trim(),
        location_name: (req.body.location_name || '').trim(),
        location_address: (req.body.location_address || '').trim(),
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        status: (req.body.status || 'Upcoming').trim()
    };

    form.formStatusUpcoming = form.status === 'Upcoming';
    form.formStatusPast = form.status === 'Past';

    if (Object.keys(errors).length > 0) {
        return appointmentsModel.getAll((err, rows) => {
            if (err) return res.status(500).send('Database error');

            res.render('index', {
                pageTitle: 'Simple Appointment Planner',
                appointments: rows,
                selected: rows.length > 0 ? rows[0] : null,
                errors,
                form
            });
        });
    }

    const apptToInsert = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude)
    };

    appointmentsModel.create(apptToInsert, (err) => {
        if (err) return res.status(500).send('Database error');
        res.redirect('/');
    });
}

module.exports = {
    showHome,
    showById,
    createAppointment
};