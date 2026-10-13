const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hks_db'
});

db.connect(function(err) {
    if (err) throw err;
    console.log('MySQL Connected!');
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'hks-duty-hour-secret',
    resave: false,
    saveUninitialized: true
}));

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    req.session.message = '';
    next();
});

function loginRequired(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
}

function teacherRequired(req, res, next) {
    if (!req.session.user || (req.session.user.role !== 'Teacher' && req.session.user.role !== 'Admin')) {
        return res.redirect('/dashboard');
    }
    next();
}

function adminRequired(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.redirect('/dashboard');
    next();
}

app.get('/', function(req, res) {
    if (req.session.user) return res.redirect('/dashboard');
    res.render('login', { title: 'HKS Login' });
});

app.get('/login', function(req, res) {
    res.render('login', { title: 'HKS Login' });
});

app.post('/login', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            req.session.user = result[0];
            res.redirect('/dashboard');
        } else {
            req.session.message = 'Wrong email or password.';
            res.redirect('/login');
        }
    });
});

app.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.redirect('/login');
    });
});

app.get('/dashboard', loginRequired, function(req, res) {
    if (req.session.user.role === 'Teacher') return res.redirect('/teacher');
    if (req.session.user.role === 'Admin') return res.redirect('/admin');

    db.query('SELECT * FROM duty_logs WHERE student_id = ? ORDER BY duty_date DESC', [req.session.user.id], function(err, logs) {
        if (err) throw err;
        db.query('SELECT * FROM duty_slots WHERE duty_date >= CURDATE() ORDER BY duty_date', function(err, slots) {
            if (err) throw err;
            db.query('SELECT semester, SUM(hours) AS total_hours FROM duty_logs WHERE student_id = ? GROUP BY semester', [req.session.user.id], function(err, balances) {
                if (err) throw err;
                res.render('student', { title: 'Student Dashboard', logs: logs, slots: slots, balances: balances });
            });
        });
    });
});

app.get('/teacher', loginRequired, teacherRequired, function(req, res) {
    db.query('SELECT * FROM duty_slots WHERE teacher_id = ? ORDER BY duty_date DESC', [req.session.user.id], function(err, slots) {
        if (err) throw err;
        db.query('SELECT duty_logs.*, users.full_name FROM duty_logs JOIN users ON duty_logs.student_id = users.id ORDER BY duty_logs.duty_date DESC', function(err, logs) {
            if (err) throw err;
            db.query("SELECT * FROM users WHERE role = 'Student' ORDER BY full_name", function(err, students) {
                if (err) throw err;
                res.render('teacher', { title: 'Supervisor Dashboard', slots: slots, logs: logs, students: students });
            });
        });
    });
});

/* CREATE: add a duty slot */
app.post('/slots/add', loginRequired, teacherRequired, function(req, res) {
    const data = [
        req.body.title, req.body.department, req.body.duty_date, req.body.start_time,
        req.body.end_time, req.body.location, req.body.max_students, req.session.user.id
    ];
    db.query('INSERT INTO duty_slots (title, department, duty_date, start_time, end_time, location, max_students, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data, function(err) {
        if (err) throw err;
        res.redirect('/teacher');
    });
});

/* CREATE: add a duty-hour record */
app.post('/logs/add', loginRequired, teacherRequired, function(req, res) {
    const data = [
        req.body.student_id, req.session.user.id, req.body.duty_date, req.body.location,
        req.body.position_name, req.body.hours, req.body.semester
    ];
    db.query('INSERT INTO duty_logs (student_id, teacher_id, duty_date, location, position_name, hours, semester) VALUES (?, ?, ?, ?, ?, ?, ?)', data, function(err) {
        if (err) throw err;
        res.redirect('/teacher');
    });
});

/* UPDATE: edit a duty-hour record */
app.post('/logs/edit/:id', loginRequired, teacherRequired, function(req, res) {
    const data = [
        req.body.duty_date, req.body.location, req.body.position_name,
        req.body.hours, req.body.semester, req.params.id
    ];
    db.query('UPDATE duty_logs SET duty_date = ?, location = ?, position_name = ?, hours = ?, semester = ? WHERE id = ?', data, function(err) {
        if (err) throw err;
        res.redirect('/teacher');
    });
});

/* DELETE: remove a duty-hour record */
app.get('/logs/delete/:id', loginRequired, teacherRequired, function(req, res) {
    db.query('DELETE FROM duty_logs WHERE id = ?', [req.params.id], function(err) {
        if (err) throw err;
        res.redirect('/teacher');
    });
});

/* READ: admin views users */
app.get('/admin', loginRequired, adminRequired, function(req, res) {
    db.query('SELECT * FROM users ORDER BY id DESC', function(err, users) {
        if (err) throw err;
        res.render('admin', { title: 'Admin Dashboard', users: users });
    });
});

/* CREATE: add user */
app.post('/users/add', loginRequired, adminRequired, function(req, res) {
    db.query('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        [req.body.full_name, req.body.email, req.body.password, req.body.role], function(err) {
            if (err) throw err;
            res.redirect('/admin');
        });
});

/* UPDATE: update user */
app.post('/users/edit/:id', loginRequired, adminRequired, function(req, res) {
    db.query('UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?',
        [req.body.full_name, req.body.email, req.body.role, req.params.id], function(err) {
            if (err) throw err;
            res.redirect('/admin');
        });
});

/* DELETE: delete user */
app.get('/users/delete/:id', loginRequired, adminRequired, function(req, res) {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) throw err;
        res.redirect('/admin');
    });
});

app.listen(3000, function() {
    console.log('HKS system running at http://localhost:3000');
});
