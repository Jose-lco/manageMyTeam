DROP DATABASE employee_tracker;
CREATE DATABASE employee_tracker;
USE employee_tracker;
CREATE TABLE department
(
    id INT AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY(id)
);
CREATE TABLE role
(
    id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL(10,4),
    department_id INT,
    FOREIGN KEY(department_id) REFERENCES department(id),
    PRIMARY KEY(id)
);
CREATE TABLE employee
(
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    FOREIGN KEY(role_id) REFERENCES role(id),
    FOREIGN KEY(manager_id) REFERENCES employee(id),
    PRIMARY KEY(id)
);
