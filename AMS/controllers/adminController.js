const User = require('../models/user.js');


exports.getUser= async (req, res) => {
    const users = await User.find();
    res.render('admin', {
        email: users[0].email,
        users: users
    })
}


// exports.getAdminDashboard = (req, res) => {
//     if (!req.session.username) {
//         res.redirect('/admin/login');
//     } else {
//         res.render('dashboard/admin', {
//             email: req.session.username,
//             page: ""
//         });
//     }
// };

exports.logoutAdmin = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/login');
        }
    });
};

exports.getAdminLoginForm = (req, res) => {
    res.render('admin/loginForm', {
        layout:false
    });
};

exports.loginAdmin = async (req, res) => {
    try {
        let { email, pswd } = req.body;
        const user = await User.find({ email: email, password: pswd });
        if (user.length != 0 && user[0].role == "admin") {
            req.session.username = email;
            res.redirect('/admin/dashboard');
        } else {
            res.send("Invalid User or You are not an Admin!");
        }
    } catch (error) {
        console.log(error);
    }
};


exports.getAdminDashboard = (req, res) => {
    if (!req.session.username) {
        res.redirect('/admin/login');
    } else {
        res.render('admin/welcomePage', {
            email: req.session.username,
            page: "",
            layout: './layouts/admin-dashboard-layout'
        });
    }
};

exports.logoutAdmin = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/admin/login');
        }
    });
};

// exports.getAdminLoginForm = (req, res) => {
//     res.render('admin/loginForm');
// };

exports.loginAdmin = async (req, res) => {
    try {
        let { email, pswd } = req.body;
        const user = await User.find({ email: email, password: pswd });
        if (user.length != 0 && user[0].role == "admin") {
            req.session.username = email;
            res.redirect('/admin/dashboard');
        } else {
            res.send("Invalid User or You are not an Admin!");
        }
    } catch (error) {
        console.log(error);
    }
};

