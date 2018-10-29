const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./api/routes/posts');
const userRoutes = require('./api/routes/user');

const app = express();

mongoose.connect('mongodb+srv://niranjan:7XGtvE6oWm1ZvwuE@cluster0-mxvwq.mongodb.net/mean-app-db?retryWrites=true', { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(() => {
    console.log('Connection failed');
  });

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

//mongodb details
//username - niranjan.iphotoz@gmail.com
//password - ssNTS123!555
//DB Username - niranjan
//DB Password - 7XGtvE6oWm1ZvwuE

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);

//If no matching route is found, then redirect to this route and display error accordingly
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

//If error is not caught above, then the below code block will execute to show the error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
