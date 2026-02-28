const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');

const appointmentsController = require('./controllers/appointments.ctrl');
const appointmentsModel = require('./models/appointments.model');

const app = express();

// Initialize database
appointmentsModel.init();

// Mustache setup
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', appointmentsController.showHome);
app.get('/appointments/:id', appointmentsController.showById);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});