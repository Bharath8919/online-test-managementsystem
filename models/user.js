const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    info: {
        type: String,
        required: true
    }

})

const User = mongoose.model('user', UserSchema);

// Hera after the User is created and linked with the Database.

/* Exporting this schema so that other pages can use this as well. */
module.exports = User;