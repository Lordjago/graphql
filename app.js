require('dotenv').config()

const express = require('express');

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const { graphqlHTTP } = require('express-graphql')

const graphqlSchema = require('./graphql/schema')

const graphqlResolver = require('./graphql/resolver')

const helper = require('./helper/function')

const auth = require('./helper/auth')

const cors = require('cors')

const path = require('path')

const multer = require('multer')

const app = express();

const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({storage: storage, fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(cors())

app.use(auth)

app.put('/post-image', (req, res, next) => {
    if (req.isAuth === false) {
        const error = new Error("Not authenticated.")
        error.code = 401
        throw error
    }
    if (!req.file) {
        res.status(200).json({message : 'No file provided'})
    }
    if(req.file.oldPath) {
        helper.clearImage(req.file.oldPath)
    }
    return res.status(201).json({message : "File stored", filePath: req.file.path})
})


app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
        if(!err.originalError) {
            return err
        }
        const data = err.originalError.data;
        const message = err.message
        const code = err.originalError.code
        return {message: message, code: code, data: data}
    }
}))

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500;
    const data = error.data
    const message = error.message;
    res.status(status).json({
        message: message,
        data: data

    })
})

mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
    console.log("Database Connection Successfull")
    app.listen(8080, console.log("Running a GraphQL API server at http://localhost:8080/graphql"));
})
.catch((err) => {
    console.log(err)
})

