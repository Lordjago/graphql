require('dotenv').config()

const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkZWdva2VhYmR1bGF6ZWV6NjUzQGdtYWlsLmNvbSIsInVzZXJJZCI6IjYxNjcyNzljMGQyMDAyZDZjZWUzY2I5YSIsImlhdCI6MTYzNDc0MjQwOCwiZXhwIjoxNjM0NzQ2MDA4fQ.RNpw9v5bL_fMUnwSKwAU3WBeMhZTcfiuwYd2FkVtFpg'
    // const authHeader = req.get('Authorization');
    // console.log(`Before ${authHeader}`)
    if (!authHeader) {
        req.isAuth = false
        return next();
    }
    try {
        // authHeader = authHeader.split(' ')[1]
        if(authHeader) {
            jwt.verify(authHeader, process.env.ACCESS_TOKEN, (err, decodedToken) => {
                if(err) {
                    req.isAuth = false
                    return next();
                }
                req.userId = decodedToken.userId
                req.isAuth = true
                // console.log(`After ${authHeader}`)
                next()
            })  
        }
    } catch (error) {
        req.isAuth = false
        return next();
    }
}

