const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const ContactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

const Contact = mongoose.model('contact', ContactSchema);

// Hera after the User is created and linked with the Database.

/* Exporting this schema so that other pages can use this as well. */
module.exports = Contact;