const express = require('express')
const mustacheExpress = require('mustache-express')
const path = require('path')

const appointmentsController = require('./controllers/appointments.ctrl')
const appointmentsModel = require('./models/appointments.model')

const app = express()

appointmentsModel.init()

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))

app.get('/', appointmentsController.showHome)
app.get('/appointments/:id', appointmentsController.showById)
app.get('/appointments/:id/edit', appointmentsController.showEdit)

app.post('/appointments', appointmentsController.createAppointment)
app.post('/appointments/:id/update', appointmentsController.updateAppointment)
app.post('/appointments/:id/delete', appointmentsController.deleteAppointment)

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})