require("dotenv").config();

const express = require('express');
const { json, header } = require('express/lib/response');
const app = express();
const FormData = require('form-data');

const mongoose = require('mongoose');

const https = require('https');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.engine('ejs', require('ejs').renderFile);

app.set('view engine', 'ejs');


app.route('/').get((req, res) =>{
    var name = 'iker'
    res.render('home', {name});

}).post((req, res) =>{

    
    res.send('Your BMI is: ');

})


app.listen(5000, ()=>{
    console.log('corriendo en el puerto 5000')
});