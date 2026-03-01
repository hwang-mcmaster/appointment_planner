const appointmentsModel = require('../models/appointments.model')

function validateAppointment(body) {
    const errors = {}

    const title = (body.title || '').trim()
    const date = (body.date || '').trim()
    const start_time = (body.start_time || '').trim()
    const end_time = (body.end_time || '').trim()

    if (title.length < 2) errors.title = 'Title must be at least 2 characters'

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = 'Date must be in YYYY-MM-DD format'
    if (!/^\d{2}:\d{2}$/.test(start_time)) errors.start_time = 'Start time must be in HH:MM format'
    if (!/^\d{2}:\d{2}$/.test(end_time)) errors.end_time = 'End time must be in HH:MM format'

    if (!errors.start_time && !errors.end_time) {
        if (end_time <= start_time) errors.time = 'End time must be later than start time'
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
        status: 'Upcoming',
        formStatusUpcoming: true,
        formStatusPast: false
    }
}

function buildListUrls(filter, sort, q) {
    const f = filter || 'All'
    const s = sort || 'date'
    const query = (q || '').trim()
    const qPart = query.length > 0 ? `&q=${encodeURIComponent(query)}` : ''

    return {
        filterAllUrl: `/?filter=All&sort=${s}${qPart}`,
        filterUpcomingUrl: `/?filter=Upcoming&sort=${s}${qPart}`,
        filterPastUrl: `/?filter=Past&sort=${s}${qPart}`,
        sortDateUrl: `/?filter=${f}&sort=date${qPart}`,
        sortTitleUrl: `/?filter=${f}&sort=title${qPart}`,
        sortStatusUrl: `/?filter=${f}&sort=status${qPart}`,
        currentFilter: f,
        currentSort: s,
        currentQ: query
    }
}

function showHome(req, res) {
    const filter = (req.query.filter || 'All').trim()
    const sort = (req.query.sort || 'date').trim()
    const q = (req.query.q || '').trim()

    appointmentsModel.getAll(filter, sort, q, (err, rows) => {
        if (err) return res.status(500).send('Database error')

        const selected = rows.length > 0 ? rows[0] : null
        const urls = buildListUrls(filter, sort, q)

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
    const q = (req.query.q || '').trim()

    appointmentsModel.getAll(filter, sort, q, (err, rows) => {
        if (err) return res.status(500).send('Database error')

        appointmentsModel.getById(id, (err2, selected) => {
            if (err2) return res.status(500).send('Database error')

            const urls = buildListUrls(filter, sort, q)

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
        status: (req.body.status || 'Upcoming').trim()
    }

    form.formStatusUpcoming = form.status === 'Upcoming'
    form.formStatusPast = form.status === 'Past'

    if (Object.keys(errors).length > 0) {
        const filter = 'All'
        const sort = 'date'
        const q = ''
        const urls = buildListUrls(filter, sort, q)

        return appointmentsModel.getAll(filter, sort, q, (err, rows) => {
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

    appointmentsModel.create(form, (err) => {
        if (err) return res.status(500).send('Database error')
        res.redirect('/?filter=All&sort=date')
    })
}

function deleteAppointment(req, res) {
    const id = Number(req.params.id)

    appointmentsModel.deleteById(id, (err) => {
        if (err) return res.status(500).send('Database error')
        res.redirect('/?filter=All&sort=date')
    })
}

function showEdit(req, res) {
    const id = Number(req.params.id)
    const filter = (req.query.filter || 'All').trim()
    const sort = (req.query.sort || 'date').trim()
    const q = (req.query.q || '').trim()

    appointmentsModel.getAll(filter, sort, q, (err, rows) => {
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
                status: selected.status || 'Upcoming'
            }

            form.formStatusUpcoming = form.status === 'Upcoming'
            form.formStatusPast = form.status === 'Past'

            const urls = buildListUrls(filter, sort, q)

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
        status: (req.body.status || 'Upcoming').trim()
    }

    form.formStatusUpcoming = form.status === 'Upcoming'
    form.formStatusPast = form.status === 'Past'

    if (Object.keys(errors).length > 0) {
        const filter = 'All'
        const sort = 'date'
        const q = ''
        const urls = buildListUrls(filter, sort, q)

        return appointmentsModel.getAll(filter, sort, q, (err, rows) => {
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

    appointmentsModel.updateById(id, form, (err) => {
        if (err) return res.status(500).send('Database error')
        res.redirect(`/appointments/${id}?filter=All&sort=date`)
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