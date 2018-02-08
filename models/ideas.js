const mongoose = require('mongoose');

const ideaSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    created: { type: String, required: true },
});

const Ideas = mongoose.model('Ideas', ideaSchema, 'Ideas');

module.exports = { Ideas };
