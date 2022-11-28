const express = require('express');
const path = require('path');

const acme = require('./acme');

const app = express();

app.get('/api', async (req, res) => {
    try { 
        res.json(await acme());
    } catch(err) {
        console.warn('Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.use('/', express.static(path.join(__dirname, 'static')));

module.exports = app;
