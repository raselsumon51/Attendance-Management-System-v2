const express = require('express');
const app = express();
const { Course1, getAllCourse } = require('../models/Course1.model');
const Student1 = require('../models/Student1.model');
const { Attendance } = require('../models/Attendance.model');
const { getAllCourses, getMarksForm } = require('./courseController');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment.model');
const Student1Model = require('../models/Student1.model');
const Mark = require('../models/Mark.model');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


exports.takeAttendance = async (req, res) => {
    try {
        if (!req.session.teacher_email) {
            res.send("Session expired");
            // res.redirect('/teacher/login');
        } else {
            courses = await Course1.find({ teacher: req.session.teacher_id });
            if (courses.length === 0) {
                res.render('course/choose-course', {
                    errorMessage: "You are not assigned in a course",
                    email: req.session.email,
                    courses: [],
                    teacher_id: req.session.teacher_id,
                    layout: './layouts/teacher-dashboard-layout',
                });
            } else {
                res.render('course/choose-course', {
                    courses,
                    email: req.session.email,
                    errorMessage: "",
                    teacher_id: req.session.teacher_id,
                    layout: './layouts/teacher-dashboard-layout'
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
};

exports.insertAttendance = async (req, res) => {

    // let today = new Date();
    // const formattedToday = today.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });

    // const month = today.getMonth() + 1;
    // const day = today.getDate();
    // const year = today.getFullYear();

    // const formattedDate = `${month}/${day}/${year}`;
    // console.log(req.body.attendance_data.date);

    //convert the form date to dd/mm/yy
    const date = new Date(req.body.attendance_data.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
    ///console.log(formattedDate);



    // const today = new Date();
    // const options = { day: '2-digit', month: '2-digit', year: '2-digit' };
    // const formattedDate = today.toLocaleDateString('en-GB', options);

    try {
        const attendance = await Attendance.findOne({
            attendance_value: true,
            student: req.body.attendance_data.student_id,
            course: req.body.attendance_data.course_id,
            attendance_date: formattedDate
        });

        if (attendance) {
            await Attendance.deleteOne({
                attendance_value: true,
                student: req.body.attendance_data.student_id,
                course: req.body.attendance_data.course_id,
                attendance_date: formattedDate
            });
            res.json({ msg: "Attendance deleted" });
        } else {
            const newAttendance = new Attendance({
                attendance_value: true,
                student: req.body.attendance_data.student_id,
                course: req.body.attendance_data.course_id,
                attendance_date: formattedDate
            });

            await newAttendance.save();
            res.json({ msg: "New Attendance Recorded" });
        }
    } catch (err) {
        console.error(err);
    }
};

exports.sliderAttendance = async (req, res) => {
    const { course_id, date } = req.body;
    //const students = await Student1.find();
    const enrolledStudents = await Enrollment.find({ course_id: course_id })
        .populate('student_id')
        .exec();

    res.render('attendance/attendance-slider', {
        page: "attendance-slider",
        course_id,
        teacher_id: req.session.teacher_id,
        date,
        enrolledStudents,
        teacher_email: req.session.teacher_email,
        layout: './layouts/teacher-dashboard-layout'
    });
};

exports.showAllCourses = async (req, res) => {
    console.log(req.params.dashboard)
    const courses = await Course1.find();
    if (req.params.dashboard == "student-dashboard") {
        res.render('student/course-list-attendance', { layout: './layouts/student', student_id: req.session.student_id, courses, dashboard: "student-dashboard" });
    }
    else if (req.params.dashboard == "teacher-dashboard") {
        res.render('student/course-list-attendance', { layout: './layouts/teacher-dashboard-layout', teacher_id: req.session.teacher_id, courses, dashboard: "teacher-dashboard" });
    }
}

exports.showCourseAttendance = async (req, res) => {
    const course_id = req.params.course_id;
    try {
        const results = await Attendance.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(course_id),
                },
            },
            {
                $group: {
                    _id: '$student',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
        ]);
        // console.log(results);
        const studentIds = results.map(result => result._id);
        const students = await Student1.find({ _id: { $in: studentIds } });

        let populatedResults = results.map(result => {
            const student = students.find(student => student._id.equals(result._id));
            return {
                _id: student._id,
                name: student.name,
                count: result.count,
            };
        });

        //find total classes
        const uniqueDates = await Attendance.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(course_id) } },
            { $group: { _id: '$attendance_date' } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        const total_class = uniqueDates.length > 0 ? uniqueDates[0].count : 0;

        //console.log(populatedResults);


        let allStudents = await Enrollment.find({ course_id }).populate('student_id').select('student_id');

        allStudents = allStudents.map(enrollment => enrollment.student_id);
        console.log(allStudents);
        const output = allStudents.map(student => {
            const result = populatedResults.find(res => res._id.toString() === student._id.toString());
            if (result) {
                return result;
            } else {
                let newstd = {
                    _id: student._id,
                    name: student.name,
                    count: 0
                };
                return newstd;
            }
        });

        const latestMark = await Mark.find({}).sort({ date: -1 });
        //my marks
        const output1 = output.filter(obj => obj._id.toString() === req.session.student_id.toString());
        const course_name = await Course1.findOne({_id:course_id});


        if (req.params.dashboard == "student-dashboard") {
            res.render('student/course-attendance', { layout: './layouts/student', student_id: req.session.student_id, results: output1, total_class, latestMark ,course_name:course_name.name,course_id});
        }
        else if (req.params.dashboard == "teacher-dashboard") {
            res.render('student/course-attendance', { layout: './layouts/teacher-dashboard-layout', teacher_id: req.session.teacher_id, results: output1, total_class, latestMark ,course_name:course_name.name,course_id});
        }

    } catch (error) {
        console.error('Error executing the query:', error);
    }
};

//get calender
exports.getCalender = async (req, res) => {
    // Generate sample data for student attendance
    console.log("test1");
    const attendanceData = {
        '2023-07-02': 'present',
        '2023-07-04': 'absent',
        '2023-07-17': 'present',
        '2023-07-20': 'absent'
    };

    // Generate an array of date objects for the current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const dates = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dateObj = {
        date: d.getDate(),
        formattedDate: d.toISOString().split('T')[0],
        attendance: attendanceData[d.toISOString().split('T')[0]] || ''
        };
        dates.push(dateObj);
    }
    const course_id = req.params.course_id;
    res.render('student/student-calender', {dates, layout: './layouts/student', student_id: req.session.student_id});
}