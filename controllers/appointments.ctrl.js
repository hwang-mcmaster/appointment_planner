const appointmentsModel = require('../models/appointments.model')

function validateAppointment(body) {
    const errors = {}

    const title = (body.title || '').trim()
    const date = (body.date || '').trim()
    const start_time = (body.start_time || '').trim()
    const end_time = (body.end_time || '').trim()

    const latitude = body.latitude === '' || body.latitude === undefined ? null : Number(body.latitude)
    const longitude = body.longitude === '' || body.longitude === undefined ? null : Number(body.longitude)

    if (title.length < 2) errors.title = 'Title must be at least 2 characters'

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = 'Date must be in YYYY-MM-DD format'
    if (!/^\d{2}:\d{2}$/.test(start_time)) errors.start_time = 'Start time must be in HH:MM format'
    if (!/^\d{2}:\d{2}$/.test(end_time)) errors.end_time = 'End time must be in HH:MM format'

    if (!errors.start_time && !errors.end_time) {
        if (end_time <= start_time) errors.time = 'End time must be later than start time'
    }

    const hasLat = body.latitude !== '' && body.latitude !== undefined
    const hasLng = body.longitude !== '' && body.longitude !== undefined

    if (hasLat || hasLng) {
        if (!hasLat || !hasLng) {
            errors.coords = 'Latitude and longitude must both be provided'
        } else {
            if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) errors.latitude = 'Latitude must be between -90 and 90'
            if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) errors.longitude = 'Longitude must be between -180 and 180'
        }
    }

    return errors
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
    }
}

function buildListUrls(filter, sort) {
    const f = filter || 'All'
    const s = sort || 'date'

    return {
        filterAllUrl: `/?filter=All&sort=${s}`,
        filterUpcomingUrl: `/?filter=Upcoming&sort=${s}`,
        filterPastUrl: `/?filter=Past&sort=${s}`,
        sortDateUrl: `/?filter=${f}&sort=date`,
        sortTitleUrl: `/?filter=${f}&sort=title`,
        sortStatusUrl: `/?filter=${f}&sort=status`,
        currentFilter: f,
        currentSort: s
    }
}

function showHome(req, res) {
    const filter = (req.query.filter || 'All').trim()
    const sort = (req.query.sort || 'date').trim()

    appointmentsModel.getAll(filter, sort, (err, rows) => {
        if (err) return res.status(500).send('Database error')

        const selected = rows.length > 0 ? rows[0] : null
        const urls = buildListUrls(filter, sort)

        res.render('index', {
            pageTitle: 'Simple Appointment Planner',
            appointments: rows,
            selected,
            form: defaultForm(),
            errors: {},
            ...urls
        })
    })
}

function showById(req, res) {
    const id = Number(req.params.id)
    const filter = (req.query.filter || 'All').trim()
    const sort = (req.query.sort || 'date').trim()

    appointmentsModel.getAll(filter, sort, (err, rows) => {
        if (err) return res.status(500).send('Database error')

        appointmentsModel.getById(id, (err2, selected) => {
            if (err2) return res.status(500).send('Database error')

            const urls = buildListUrls(filter, sort)

            res.render('index', {
                pageTitle: 'Simple Appointment Planner',
                appointments: rows,
                selected,
                form: defaultForm(),
                errors: {},
                ...urls
            })
        })
    })
}

function createAppointment(req, res) {
    const errors = validateAppointment(req.body)

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
    }

    form.formStatusUpcoming = form.status === 'Upcoming'
    form.formStatusPast = form.status === 'Past'

    if (Object.keys(errors).length > 0) {
        const filter = 'All'
        const sort = 'date'
        const urls = buildListUrls(filter, sort)

        return appointmentsModel.getAll(filter, sort, (err, rows) => {
            if (err) return res.status(500).send('Database error')

            res.render('index', {
                pageTitle: 'Simple Appointment Planner',
                appointments: rows,
                selected: rows.length > 0 ? rows[0] : null,
                errors,
                form,
                ...urls
            })
        })
    }

    const apptToInsert = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude)
    }

    appointmentsModel.create(apptToInsert, (err) => {
        if (err) return res.status(500).send('Database error')
        res.redirect('/')
    })
}

function deleteAppointment(req, res) {
    const id = Number(req.params.id)

    appointmentsModel.deleteById(id, (err) => {
        if (err) return res.status(500).send('Database error')
        res.redirect('/')
    })
}

function showEdit(req, res) {
    const id = Number(req.params.id)
    const filter = (req.query.filter || 'All').trim()
    const sort = (req.query.sort || 'date').trim()

    appointmentsModel.getAll(filter, sort, (err, rows) => {
        if (err) return res.status(500).send('Database error')

        appointmentsModel.getById(id, (err2, selected) => {
            if (err2) return res.status(500).send('Database error')
            if (!selected) return res.redirect('/')

            const form = {
                title: selected.title || '',
                description: selected.description || '',
                date: selected.date || '',
                start_time: selected.start_time || '',
                end_time: selected.end_time || '',
                location_name: selected.location_name || '',
                location_address: selected.location_address || '',
                latitude: selected.latitude === null || selected.latitude === undefined ? '' : String(selected.latitude),
                longitude: selected.longitude === null || selected.longitude === undefined ? '' : String(selected.longitude),
                status: selected.status || 'Upcoming'
            }

            form.formStatusUpcoming = form.status === 'Upcoming'
            form.formStatusPast = form.status === 'Past'

            const urls = buildListUrls(filter, sort)

            res.render('index', {
                pageTitle: 'Simple Appointment Planner',
                appointments: rows,
                selected,
                form,
                errors: {},
                editMode: true,
                editId: id,
                ...urls
            })
        })
    })
}

function updateAppointment(req, res) {
    const id = Number(req.params.id)
    const errors = validateAppointment(req.body)

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
    }

    form.formStatusUpcoming = form.status === 'Upcoming'
    form.formStatusPast = form.status === 'Past'

    if (Object.keys(errors).length > 0) {
        const filter = 'All'
        const sort = 'date'
        const urls = buildListUrls(filter, sort)

        return appointmentsModel.getAll(filter, sort, (err, rows) => {
            if (err) return res.status(500).send('Database error')

            appointmentsModel.getById(id, (err2, selected) => {
                if (err2) return res.status(500).send('Database error')

                res.render('index', {
                    pageTitle: 'Simple Appointment Planner',
                    appointments: rows,
                    selected,
                    errors,
                    form,
                    editMode: true,
                    editId: id,
                    ...urls
                })
            })
        })
    }

    const apptToUpdate = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude)
    }

    appointmentsModel.updateById(id, apptToUpdate, (err) => {
        if (err) return res.status(500).send('Database error')
        res.redirect(`/appointments/${id}`)
    })
}

module.exports = {
    showHome,
    showById,
    createAppointment,
    deleteAppointment,
    showEdit,
    updateAppointment
}