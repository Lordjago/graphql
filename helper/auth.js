require('dotenv').config()

const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    // const authHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkZWdva2VhYmR1bGF6ZWV6NjUzQGdtYWlsLmNvbSIsInVzZXJJZCI6IjYxNjcyNzljMGQyMDAyZDZjZWUzY2I5YSIsImlhdCI6MTYzNDU2MjkxMCwiZXhwIjoxNjM0NTY2NTEwfQ.QXciCekDdqs6rCrZ0iSw8ZDZ5IugfImTrnUQ6ptH_2s'
    const authHeader = req.get('Authorization')
    if (!authHeader) {
        req.isAuth = false
        return next();
    }
    try {
        authHeader = authHeader.split(' ')[1];
        if(authHeader) {
            jwt.verify(authHeader, process.env.ACCESS_TOKEN, (err, decodedToken) => {
                if(err) {
                    req.isAuth = false
                    return next();
                }
                req.userId = decodedToken.userId
                req.isAuth = true
                next()
            })
        }
    } catch (error) {
        req.isAuth = false
        return next();
    }
}



