const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');

const appointmentsModel = require('./models/appointments.model')
appointmentsModel.init()

const app = express();

// Mustache setup
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Basic route
const appointmentsController = require('./controllers/appointments.ctrl');

app.get('/', appointmentsController.showHome);
app.get('/appointments/:id', appointmentsController.showById)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});