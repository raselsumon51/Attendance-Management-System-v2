const express = require('express');
const { getRegistrationPage, postRegistrationData, saveEnrollData, editStudent, updateStudent, getAllStudents, getLoginForm, loginStudent, logoutStudent, getDashboard, profile, calender } = require('../controllers/students.controller');
const app = express();
const router = express.Router();
const studentAuthMiddleware = require('../middlewares/studentAuthMiddleware');


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// router.get('/all', function (req, res) {
//     getStudents();
//     async function getStudents() {
//         try {
//             res.json(await Student.find());
//         } catch (error) {
//             console.log(error);
//         }
//     }
// })

// router.get('/login', function (req, res) {
//     res.render('student/student-login-form', {
//         page: ""
//     });
// })

// router.post('/login', async function (req, res) {
//     try {
//         let { email, pswd } = req.body;
//         const student = await Student1.find({ email: email, password: pswd });
//         console.log(student[0]._id);
//         if (student.length != 0) {
//             req.session.student_email = email;
//             req.session.student_id = student[0]._id;
//             res.redirect('/student/dashboard');
//         }
//         else
//             res.send("Email and password are not matched or You are not a Student!");
//     } catch (error) {
//         console.log(error)
//     }
// })

// router.get('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect('/student/login');
//         }
//     });
// });

// router.get('/dashboard', function (req, res) {
//     if (!req.session.student_email) {
//         res.redirect('/student/login');
//     }
//     else {
//         res.render('student/student-index', {
//             student_email: req.session.student_email,
//             page: "",
//             student_id: req.session.student_id,
//             pageTitle: 'Dashboard Page',
//             layout: './layouts/student'
//         });
//     }
// })

router.get('/all', getAllStudents);
router.get('/login', getLoginForm);
router.post('/login', loginStudent);
router.get('/logout', logoutStudent);
router.get('/dashboard', getDashboard);

router.get('/registration', getRegistrationPage)
router.post('/register', postRegistrationData)
router.get('/enroll', saveEnrollData)
router.get('/:id/edit', studentAuthMiddleware, editStudent)
router.get('/:id/profile', studentAuthMiddleware, profile)
// router.get('/:id/calender', studentAuthMiddleware, calender)
router.post('/:id/update', studentAuthMiddleware, updateStudent)


module.exports = router;