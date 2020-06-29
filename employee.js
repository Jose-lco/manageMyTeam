let mysql = require('mysql');
let inquirer = require('inquirer');
require('dotenv').config();
let db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.PASSWORD,
    database: 'employee_tracker'
});
db.connect(err => {
    if (err) throw err;
    console.log(`Database connecting on port ${db.threadId}`);
    runStart();
})
async function runStart() {
    let start = await inquirer.prompt({
        type: 'list',
        name: 'firstQuestion',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all employees by department',
            'View all employees by manager',
            'Add employee',
            'Remove an employee',
            'Update employee role',
            'Update employee manager',
            'Exit'
        ]
    });
    switch (start.firstQuestion) {
        case 'View all employees':
            viewAll();
            break;
        case 'View all employees by department':
            viewAllByDepartment();
            break;
        case 'View all employees by manager':
            viewAllByManager();
            break;
        case 'Add employee':
            addEmployee();
            break;
        case 'Remove an employee':
            removeEmployee();
            break;
        case 'Update employee role':
            updateEmployeeRole();
            break;
        case 'Update employee manager':
            updateEmployeeManager();
            break;
        case 'Exit':
            db.end();
            break;
    }
}
function viewAll() {
    db.query('SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        runStart();
    })
}
function viewAllByDepartment() {
    db.query('SELECT name FROM department', async (err, res) => {
        if (err) throw err;
        let answer = await inquirer.prompt({
            type: 'list',
            name: 'department',
            message: 'What department would you like to search for?',
            choices: [...res]
        })
        db.query('SELECT first_name, last_name, title, salary, name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department.name = ?', [answer.department], (err, res) => {
            if (err) throw err;
            console.table(res);
            runStart();
        })
    })
}
function viewAllByManager() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS "Managers" FROM employee WHERE (employee.id IN (SELECT manager_id FROM employee))', async (err, res) => {
        if (err) throw err;
        let result = [];
        Object.keys(res).forEach(key => {
            result.push(res[key].Managers);
        });
        let answer = await inquirer.prompt({
            type: 'list',
            name: 'manager',
            message: 'Which manager would you like to search for?',
            choices: result
        })
        db.query('SELECT emp.first_name, emp.last_name FROM employee emp, employee mgr WHERE emp.manager_id = (SELECT id FROM (SELECT id FROM employee WHERE (SELECT CONCAT(mgr.first_name + " " + mgr.last_name) = ?))manager)', [answer.manager], (err, res) => {
            if (err) throw err;
            console.table(res);
            runStart();
        })
    })
}
function addEmployee() {
    db.query('SELECT title FROM role', async (err, res) => {
        if (err) throw err;
        let data = [];
        Object.keys(res).forEach(key => {
            data.push(res[key].title);
        })
        let answer = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "What is the employee's first name?"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is the employee's last name?"
            },
            {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: data
            }
        ])
        db.query('INSERT INTO employee(first_name, last_name, role_id) VALUES(?, ?,(SELECT id FROM role WHERE role.title = ?))', [answer.firstName, answer.lastName, answer.role], (err, result) => {
            if (err) throw err;
            runStart();
        })
    })
}
function removeEmployee() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS "Employees" FROM employee', async (err, res) => {
        if (err) throw err;
        let data = [];
        Object.keys(res).forEach(key => {
            data.push(res[key].Employees);
        })
        let answer = await inquirer.prompt({
            type: 'list',
            name: 'remove',
            message: 'What employee would you like to remove?',
            choices: data
        })
        db.query('DELETE FROM employee WHERE (SELECT CONCAT(first_name, " ", last_name)) = ?', [answer.remove], (err, res) => {
            if (err) throw err;
            runStart();
        })
    })
}
function updateEmployeeRole() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS "Employees" FROM employee', async (err, res) => {
        if (err) throw err;
        let data = [];
        Object.keys(res).forEach(key => {
            data.push(res[key].Employees);
        })
        let answer = await inquirer.prompt({
            type: 'list',
            name: 'update',
            message: 'What employee would you like to update?',
            choices: data
        })
        db.query('SELECT title FROM role', async (err, res) => {
            if (err) throw err;
            let info = [];
            Object.keys(res).forEach(key => {
                info.push(res[key].title);
            })
            let roleData = await inquirer.prompt({
                type: 'list',
                name: 'role',
                message: "What is the employee's new role?",
                choices: info
            })
            db.query('UPDATE employee SET role_id = (SELECT id FROM role WHERE role.title = ?) WHERE (SELECT CONCAT(first_name, " ", last_name)) = ?', [roleData.role, answer.update], (err, res) => {
                if(err)throw err;
                runStart();
            })
        })
    })
}
function updateEmployeeManager(){
    db.query('SELECT CONCAT(first_name, " ", last_name) AS "Employees" FROM employee', async (err, res) => {
        if (err) throw err;
        let data = [];
        Object.keys(res).forEach(key => {
            data.push(res[key].Employees);
        })
        let answer = await inquirer.prompt({
            type: 'list',
            name: 'update',
            message: 'What employee would you like to update?',
            choices: data
        })
        db.query('SELECT CONCAT(first_name, " ", last_name) AS "Managers" FROM employee WHERE (employee.id IN (SELECT manager_id FROM employee))', async (err, res) => {
            if (err) throw err;
            let info = [];
            Object.keys(res).forEach(key => {
                info.push(res[key].Managers);
            })
            let roleData = await inquirer.prompt({
                type: 'list',
                name: 'manager',
                message: "Who is the employee's new manager?",
                choices: info
            })
            db.query('UPDATE employee SET manager_id = (SELECT id FROM (SELECT id FROM employee WHERE (SELECT CONCAT(first_name, " ", last_name)= ?))updatedEmployee) WHERE (SELECT CONCAT(first_name, " ", last_name)= ?)', [roleData.manager, answer.update], (err, res) => {
                if(err)throw err;
                runStart();
            })
        })
    })  
}