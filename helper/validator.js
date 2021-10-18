const { check } = require('express-validator');

const User = require('../model/user')

let signup = [
    check("email").not().isEmpty().withMessage("Email is empty"),
    check("email").isEmail().normalizeEmail().withMessage("Invalid Email"),
    check("email").isLength({ min: 5 }).withMessage("Email too short, < 5").trim(),
    check("email").normalizeEmail(),

    check("password").not().isEmpty().withMessage("password is empty"),
    check("password").isLength({ min: 5 }).withMessage("password too short < 5").trim(),

];

let login = [
    check("email").not().isEmpty().withMessage("Email is empty"),
    check("email").isEmail().normalizeEmail().withMessage("Invalid Email").trim(),
    check("email").isLength({ min: 5 }).withMessage("Email too short, < 5"),

    check("password").not().isEmpty().withMessage("password is empty"),
    check("password").isLength({ min: 5 }).withMessage("password too short < 5").trim()
];

let create = [
    check('title').trim().isLength({ min: 5 }).withMessage("Title is empty"),
    check('title').trim().isLength({ min: 5 }).withMessage("Title too short"),

    check('content').trim().isLength({ min: 5 }).withMessage("Content is empty"),
    check('content').trim().isLength({ min: 5 }).withMessage("Content too short"),
];

let update = [
    check('title').trim().isLength({ min: 5 }).withMessage("Title is empty"),
    check('title').trim().isLength({ min: 5 }).withMessage("Title too short"),

    check('content').trim().isLength({ min: 5 }).withMessage("Content is empty"),
    check('content').trim().isLength({ min: 5 }).withMessage("Content too short"),

];

let status = [
    check('status').trim().isLength({ min: 5 }).withMessage("Status is empty"),
    check('status').trim().isLength({ min: 5 }).withMessage("Status too short")

];

// let forgetPassword = [
//     check("email").not().isEmpty().withMessage("Email is empty"),
//     check("email").isLength({ min: 5 }).withMessage("Email too short, < 5"),
//     check("email").isEmail().normalizeEmail().withMessage("Invalid Email")
// ];

// let resetPassword = [
//     check("token").not().isEmpty().withMessage("Token cannot be empty"),
//     check("password").not().isEmpty().withMessage("password is empty"),
//     check("password").isLength({ min: 5 }).withMessage("password too short < 5")
// ];



module.exports = {
    signup: signup,
    login: login,
    create: create,
    update: update,
    status: status
}
