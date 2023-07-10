const { Course1, getAllCourse } = require('../models/Course1.model');
const Teacher1 = require('../models/Teacher1.model');
const Enrollment = require('../models/Enrollment.model');
const Marks = require('../models/Marks.model');



exports.showCourses = async (req, res) => {
    const courses = await Course1.find({ teacher: req.session.teacher_id });
    //console.log(courses);
    res.render('course/teacher-assigned-courses', {
        page: "showCourses",
        teacher_id: req.session.teacher_id,
        courses,
        layout: './layouts/teacher-dashboard-layout'
    });
};


exports.addTeacher = async (req, res) => {
    try {
        let course = await Course1.findById(req.body.course_id);
        if (course.teacher) {
            return res.status(400).send("The teacher is already assigned to the course");
        }
        course.teacher = req.body.teacher_id;
        await course.save();
        res.send("Teacher assigned to the course");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
};


exports.getAllCourses = async (req, res) => {
    const enrollments = await Enrollment.find({ student_id: req.session.student_id }).populate('course_id').exec();
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.course_id._id.toString());

    const courses = await getAllCourse();

    res.render('student/all-courses', {
        page: "course-all",
        courses,
        enrolledCourseIds: enrolledCourseIds,
        student_email: req.session.student_email,
        student_id: req.session.student_id,
        layout: './layouts/student',
        pageTitle: "All Courses"
    });
};


exports.getCoursesAndTeachers = async (req, res) => {
    try {
        const courses = await Course1.find().populate('teacher').exec();

        res.render('course/getCourses', {
            courses,
            layout: './layouts/admin-dashboard-layout'
        });
    }
       catch (error) {
        console.log(error);
    }
};

exports.createCourse = (req, res) => {
    res.render('course/addCourse', {
        page: "createCourse",
        layout: './layouts/admin-dashboard-layout'
    });
};



exports.createNewCourse = async (req, res) => {
    const existingCourse = await Course1.findOne({ code: req.body.course_code });
    if (existingCourse) {
        res.status(409).send('Course already exists');
        return;
    }

    const course1 = new Course1({
        name: req.body.course_name,
        code: req.body.course_code,
    });

    course1.save()
        .then(course => {
            console.log(`Saved course: ${course}`);
            res.send("Course Created");
        })
        .catch(err => {
            console.error(err);
        });
};



exports.addCourseTeacher = async (req, res) => {
    try {
        const courses = await Course1.find();
        const teachers = await Teacher1.find();

        res.render('course/assign-course-teacher', {
            page: "addCourseTeacher",
            courses,
            teachers,
            layout: './layouts/admin-dashboard-layout'
        });
    } catch (error) {
        console.log(error);
    }
};


exports.teachersCourses = (req, res) => {
    res.render('dashboard/admin', {
        page: "teachersCourses"
    });
};

exports.getCourseNames = async (req, res) => {
    try {
        if (!req.session.teacher_email) {
            res.send("Session expired");
             res.redirect('/teacher/login');
        } else {
            courses = await Course1.find({ teacher: req.session.teacher_id });
            if (courses.length === 0) {
                res.render('course/set-marks-courses-name', {
                    page: "Choose-course",
                    errorMessage: "You are not assigned in a course",
                    email: req.session.email,
                    courses: [],
                    teacher_id: req.session.teacher_id,
                    layout: './layouts/teacher-dashboard-layout',
                });
            } else {
                res.render('course/set-marks-courses-name', {
                    page: "choose-course",
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



exports.getMarksForm = async (req, res) => {
   // console.log(req.body);
    try {
        if (!req.session.teacher_email) {
            res.send("Session expired");
            res.redirect('/teacher/login');
        }
        else {
            res.render('course/course-marks-form', {
                    teacher_id: req.session.teacher_id,
                    course_id: req.body.course_id,
                    layout: './layouts/teacher-dashboard-layout'
                });
            }
        
    } catch (error) {
        console.log(error);
    }
};

exports.setMarks = async (req, res) => {
    try {
        const marksData = req.body;
        const marks = new Marks(marksData);

        await marks.save();

        res.send('Marks saved successfully');
    } catch (err) {
        console.error('Error saving marks:', err);
        res.status(500).send('An error occurred while saving the marks');
    }
};

