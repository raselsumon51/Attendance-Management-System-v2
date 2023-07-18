const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
app.use(fileUpload());
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
;

const mongoose = require('mongoose');
const { getAllCourse, Course1 } = require('../models/Course1.model');
const Enrollment = require('../models/Enrollment.model');
const Student1 = require('../models/Student1.model');

exports.getRegistrationPage = async (req, res) => {
    try {
        courses = await Course1.find({ teacher: req.session.teacher_id });
        if (courses.length === 0) {
            res.render('teacher/teacher-courses', {
                errorMessage: "You are not assigned in a course",
                email: req.session.email,
                courses: [],
                teacher_id: req.session.teacher_id,
                layout: './layouts/teacher-dashboard-layout',
            });
        } else {
            res.render('teacher/teacher-courses', {
                courses,
                email: req.session.email,
                errorMessage: "",
                teacher_id: req.session.teacher_id,
                layout: './layouts/teacher-dashboard-layout'
            });
        }
    } catch (error) {
        console.log(error);
    }
    //res.render('student/student-registration', { title: 'Home Page', message: "", layout: './layouts/teacher-dashboard-layout', teacher_id: req.session.teacher_id });
};

exports.postCourseID = async (req, res) => {
    const course_id = req.body.course_id;
    //console.log(course_id)
    res.render('teacher/add-student', { course_id, message: "", layout: './layouts/teacher-dashboard-layout', teacher_id: req.session.teacher_id });
};

exports.store_form_info = async (req, res) => {
    const { student_id, name, email, password, course_id } = req.body;
    try {
        const student = new Student1({
            student_id,
            name,
            email,
            password
        });

        await student.save();

        const enrollment = new Enrollment({
            student_id: student._id, // Use the student's _id property
            course_id
        });
        console.log(enrollment)
        await enrollment.save();

        res.send("Enrollment Successful!");
    } catch (error) {
        // Handle any errors that occur during the saving process
        res.status(500).send("Error occurred during enrollment");
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        res.json(await Student.find());
    } catch (error) {
        console.log(error);
    }
};

exports.getLoginForm = (req, res) => {
    res.render('student/student-login-form', {
        page: "",
        layout: false
    });
};

exports.loginStudent = async (req, res) => {
    try {
        let { email, pswd } = req.body;
        const student = await Student1.find({ email: email, password: pswd });
        console.log(student[0]._id);
        if (student.length != 0) {
            req.session.user = 'student';
            req.session.student_email = email;
            req.session.student_id = student[0]._id;
            res.redirect('/student/dashboard');
        } else {
            res.send("Email and password are not matched or You are not a Student!");
        }
    } catch (error) {
        console.log(error);
    }
};

exports.logoutStudent = (req, res) => {
    //req.session.username = null;
    req.session.student_email = null;
    req.session.student_id = null;
    req.session.save((err) => {
        if (err) {
            console.log('Error in log out', err);
        } else {
            console.log('Log out successful');
        }
        res.redirect('/'); // Redirect to the desired location after destroying the session
    });
};

exports.getDashboard = (req, res) => {

    if (!req.session.student_email) {
        res.redirect('/student/login');
    } else {
        res.render('student/student-index', {
            student_email: req.session.student_email,
            page: "",
            student_id: req.session.student_id,
            pageTitle: 'Dashboard Page',
            layout: './layouts/student'
        });
    }
};





exports.postRegistrationData = async (req, res) => {
    const { student_id, name, email, password } = req.body

    if (!student_id || !name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' })
    }

    const existingStudent = await Student1.findOne({ email: email })

    if (existingStudent) {
        res.send('A student with this email already exists.');
    } else {
        const newStudent = new Student1({
            student_id,
            name,
            email,
            password
        })
        newStudent.save()
            .then(student => {
                res.render('student/student-registration', { message: 'Registration Successful!', layout: './layouts/teacher-dashboard-layout', teacher_id: req.session.teacher_id })
            })
            .catch(err => {
                console.error(err)
                res.status(500).json({ message: 'Error saving student record' })
            })
    }
    // res.render('student/student-index', { pageTitle: 'Home Page', layout: './layouts/student', student_email: "rr" });
};

exports.saveEnrollData = async (req, res) => {

    try {
        const { student_id, course_id } = req.query;
        const existingEnrollment = await Enrollment.findOne({ student_id: student_id, course_id: course_id });
        if (existingEnrollment) {
            res.send('The student is already enrolled in the course.');
        }
        else {
            const enrollment = new Enrollment({ student_id, course_id });
            await enrollment.save();

            res.redirect('/course/all');
        }

    } catch (error) {
        res.status(400).send(error);
    }
};

exports.editStudent = async (req, res) => {
    try {
        const student = await Student1.findOne({ _id: req.params.id });
        if (!student) {
            res.status(404).send('Student not found');
            return;
        }
        // Render the update form with the student data
        res.render('student/student-update', { student, layout: './layouts/student', student_id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};


exports.updateStudent = async (req, res) => {
    try {
        const student = await Student1.findById(req.params.id);
        if (!student) {
            res.status(404).send('Student not found');
            return;
        }
        const imageFile = req.files && req.files.image;
        //console.log(imageFile);
        imageFile.mv(`public/uploads/${imageFile.name}`, (error) => {
            if (error) {
                console.error('Error saving the file:', error);
            }
        });

        student.student_id = req.body.student_id;
        student.name = req.body.name;
        student.image = imageFile.name;
        await student.save();
        // Redirect to the student detail page
        res.send("change saved");
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

exports.profile = async (req, res) => {
    try {
        const student = await Student1.findOne({ _id: req.params.id });
        if (!student) {
            res.status(404).send('Student not found');
            return;
        }
        // Render the update form with the student data
        res.render('student/student-profile', { student, layout: './layouts/student', student_id: req.params.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

exports.uploadStudentInfo = async (req, res) => {
    
    const course_id = req.body.course_id;
    if (!req.files || !req.files.student_file) {
        return res.status(400).send('No file uploaded');
    }

    const file = req.files.student_file;
    const filePath = path.join(__dirname, file.name);

    // Move the uploaded file to the server
    file.mv(filePath, async (error) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error uploading file');
        }

        try {
            const workbook = xlsx.readFile(filePath);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const students = xlsx.utils.sheet_to_json(worksheet);

            for (const student of students) {
                let insertion_count = 0;
                // Check if a student with the same student_id or student_email already exists
                const existingStudent = await Student1.find(
                    { email: student.student_email }
                );

                if (!(existingStudent.length > 0)) {
                    // If the student does not exist, save the new student data
                    const newStudent = new Student1({
                        student_roll: student.student_id,
                        name: student.student_name,
                        email: student.student_email
                    });
                    await newStudent.save();
                    console.log('Student Saved');

                    const existingEnrollment = await Enrollment.find({ student_roll: student.student_id });
                    if (existingEnrollment.length > 0) {
                        console.log('The student is already enrolled in the course.');
                    }
                    else {
                        const enrollment = new Enrollment({ student_id: newStudent._id, course_id: course_id });
                        await enrollment.save();
                        console.log("Enrolled");
                    }
                }
            }
            res.send('Students saved successfully');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error processing the file');
        } finally {
            // Delete the file from the server after processing
            fs.unlinkSync(filePath);
        }
    });
};


