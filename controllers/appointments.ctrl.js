const appointmentsModel = require('../models/appointments.model');

function showHome(req, res) {
    const data = appointmentsModel.getSampleAppointments();

    res.render('index', {
        pageTitle: 'Simple Appointment Planner',
        appointments: data.appointments,
        selected: data.selected
    });
}

module.exports = {
    showHome
};