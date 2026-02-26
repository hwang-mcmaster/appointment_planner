function getSampleAppointments() {
    const appointments = [
        {
            id: 1,
            title: 'Team Meeting',
            date: '2026-02-10',
            start_time: '14:00',
            end_time: '15:00',
            location_name: 'Campus',
            status: 'Upcoming'
        },
        {
            id: 2,
            title: 'Doctor Visit',
            date: '2026-01-20',
            start_time: '09:00',
            end_time: '10:00',
            location_name: 'Clinic',
            status: 'Past'
        }
    ];

    return {
        appointments,
        selected: appointments[0]
    };
}

module.exports = {
    getSampleAppointments
};