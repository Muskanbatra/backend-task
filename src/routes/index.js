const express = require("express")
const router = express.Router()
const auth = require('./auth.route')
const task = require('./task.route')
const attendance = require('./attendance.routes')

const { authMiddleware } = require("../middleware/Api-auth.middleware")

const defaultRoutes = [
    {
        path: "/auth",
        route: auth
    },
    {
        path: "/tasks",
        route: task
    },
    {
        path: "/attendance",
        route: attendance
    }
]

const authRoutes = [
    // {
    //     path: "/bills",
    //     route: bills
    // },
]

// without authentication
defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

//Auth route
// router.use(authMiddleware());

// authRoutes.forEach((route) => {
//     router.use(route.path, route.route)
// })

module.exports = router
