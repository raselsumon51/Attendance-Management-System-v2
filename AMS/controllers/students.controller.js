const mongoose = require('mongoose');
const { getAllCourse, Course1 } = require('../models/Course1.model');
const Enrollment = require('../models/Enrollment.model');
const Student1 = require('../models/Student1.model');

exports.getRegistrationPage = async (req, res) => {
    console.log(req.session.teacher_id);
    res.render('student/student-registration', { title: 'Home Page', message: "", layout: './layouts/teacher-dashboard-layout', teacher_id: req.session.teacher_id });
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
        layout:false
    });
};

exports.loginStudent = async (req, res) => {
    try {
        let { email, pswd } = req.body;
        const student = await Student1.find({ email: email, password: pswd });
        console.log(student[0]._id);
        if (student.length != 0) {
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
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/student/login');
        }
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

            // const enrollments = await Enrollment.find({ student_id: student_id }).populate('course_id').exec();
            // const enrolledCourseIds = enrollments.map(enrollment => enrollment.course_id._id.toString());

            // const courses = await getAllCourse();
            // res.render('student/all-courses', {
            //     page: "course-all",
            //     courses,
            //     enrolledCourseIds: enrolledCourseIds,
            //     student_email: req.session.student_email,
            //     student_id: req.session.student_id,
            //     layout: './layouts/student',
            //     pageTitle: "All Courses"
            // });
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
        student.student_id = req.body.student_id;
        student.name = req.body.name;
        await student.save();
        // Redirect to the student detail page
        res.send("change saved");
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};




