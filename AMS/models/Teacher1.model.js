const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: String,
    password: Number
});

const Teacher1 = mongoose.model('Teacher1', teacherSchema);
module.exports = Teacher1