const express = require('express');
const app = express();
const router = express.Router();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const { getUser, getAdminDashboard, logoutAdmin, getAdminLoginForm, loginAdmin } = require('../controllers/adminController');
// const User = require('../models/user');
router.get('/', getUser);

// router.get('/dashboard', function (req, res) {
//     if (!req.session.username) {
//         res.redirect('/admin/login');
//     }
//     res.render('dashboard/admin', {
//         email: req.session.username,
//         page: ""
//     });
// })

// router.get('/logout', (req, res) => {
//     req.session.destroy((err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect('/admin/login');
//         }
//     });
// });


// router.get('/login', function (req, res) {
//     res.render('admin/loginForm');
// })

// router.post('/login', async function (req, res) {
//     try {
//         let { email, pswd } = req.body;
//         const user = await User.find({ email: email, password: pswd });
//         if (user.length != 0 && user[0].role == "admin") {
//             req.session.username = email;
//             res.redirect('/admin/dashboard');
//         }
//         else
//             // res.redirect('/admin/login');
//             res.send("Invalid User or You are not an Admin!");
//     } catch (error) {
//         console.log(error)
//     }
// })

router.get('/dashboard', getAdminDashboard);
router.get('/logout', logoutAdmin);
router.get('/login', getAdminLoginForm);
router.post('/login', loginAdmin);

module.exports = router;



