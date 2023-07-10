const mongoose = require('mongoose');
const express = require('express');
const app = express();
const Teacher1 = require('../models/Teacher1.model');
const xlsx = require('xlsx');
const fileUpload = require('express-fileupload');
app.use(fileUpload());
const path = require('path');


exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher1.findOne({ _id: req.session.teacher_id });
        console.log(teacher)
        if (!teacher) {
            res.status(404).send('Teacher not found');
            return;
        }
        // Render the update form with the student data
        res.render('teacher/teacher-update', { teacher, page: "teacher-update", teacher_id: req.session.teacher_id, layout: './layouts/teacher-dashboard-layout' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

exports.saveUpdatedTeacher = async (req, res) => {
    try {
        const teacher = await Teacher1.findById(req.params.id);
        if (!teacher) {
            res.status(404).send('teacher not found');
            return;
        }
        teacher.name = req.body.name;
        await teacher.save();
        // Redirect to the student detail page
        res.send("change saved");
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

exports.createTeacher = (req, res) => {
    res.render('teacher/addTeacher', {
        page: "createTeacher",
        layout: './layouts/admin-dashboard-layout'
    });
};

exports.loginForm = (req, res) => {
    res.render('teacher/loginForm', {
        layout: false
    });
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/teacher/login');
        }
    });
};

exports.login = async (req, res) => {
    try {
        const { email, pswd } = req.body;
        const teacher = await Teacher1.find({ email: email, password: pswd });

        if (teacher.length > 0) {
            req.session.teacher_email = email;
            req.session.teacher_id = teacher[0]._id;
            res.redirect('/teacher/dashboard');
        } else {
            res.send("Invalid User or You are not a Teacher!");
        }
    } catch (error) {
        console.log(error);
    }
};

exports.dashboard = (req, res) => {
    if (!req.session.teacher_email) {
        res.redirect('/teacher/login');
    }
    res.render('teacher/welcomePage', {
        email: req.session.teacher_email,
        layout: './layouts/teacher-dashboard-layout',
        page: "",
        teacher_id: req.session.teacher_id,
        student_email: req.session.student_email
    });
};

exports.createNewTeacher = async (req, res) => {
    try {
        const existingTeacher = await Teacher1.findOne({ email: req.body.teacher_email });
        if (existingTeacher) {
            res.status(409).send('Teacher already exists');
            return;
        }

        const newTeacher = new Teacher1({
            email: req.body.teacher_email,
            password: req.body.teacher_pass,
        });

        await newTeacher.save();
        console.log('New teacher saved to database:', newTeacher);
        res.send("New Teacher Created");
    } catch (err) {
        console.error('Error saving new teacher to database:', err);
    }
};

exports.allTeachers = async (req, res) => {
    try {
        const teachers = await Teacher1.find();
            res.render('teacher/allTeachers', {
                teachers,
                layout: './layouts/admin-dashboard-layout'
            });
    } catch (error) {
        console.log(error);
    }
};


exports.uploadTeacherEmails = (req, res) => {

    const file = req.files.teacher_file;
    const filePath = path.join(__dirname, file.name);

    file.mv(filePath, (error) => {
        if (error) {
            return res.status(500).send('Error uploading file');
        }

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const emailAddresses = data.map((row) => row.teachers_email);
        console.log(emailAddresses)

        // Perform further processing or database operations with the email addresses

        // Redirect or send a response
        res.redirect('/teacher/list');
    });
}
