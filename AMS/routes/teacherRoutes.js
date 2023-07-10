
const express = require('express');
const { updateTeacher, saveUpdateTeacher, saveUpdatedTeacher, createTeacher, loginForm, logout, login, dashboard, createNewTeacher, allTeachers, uploadTeacherEmails } = require('../controllers/teachers.controller');
const teacherAuthMiddleware = require('../middlewares/teacherAuthMiddleware');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');
const app = express();
const router = express.Router();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

router.get('/add', adminAuthMiddleware,createTeacher);
router.post('/add', adminAuthMiddleware, createNewTeacher);

router.get('/login', loginForm);
router.post('/login', login);

router.post('/upload', adminAuthMiddleware, uploadTeacherEmails);

router.get('/logout', logout);
router.get('/dashboard', dashboard);
router.get('/', adminAuthMiddleware, allTeachers);
router.get('/:id/update',teacherAuthMiddleware, updateTeacher);
router.post('/:id/update',teacherAuthMiddleware, saveUpdatedTeacher);
module.exports = router;
