require("dotenv").config();
const express = require("express");
const app = express();
const https = require("https");
const formData = require("form-data");
const mongoose = require("mongoose");

/*Estas cosas le dan poderes al archivo para que haga cosas especiales
de momento solo se que el .static sirve para tener tus elementos que no
cambian como imagenes y scripts, para eso te haces un folder con el
el nombre de lo que sigue de __dirname, dirname es una constante de js
que te da el path a tus archivos desde donde estas trabajando, si no
lo usas no te va a correr aunque escribas bien el path, como ejemplo
en la clase usamos un style.css super sencillo y desplegamos una imagen
super sencilla*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname+"/public"));

app.use((err, req, res, next)=>{
    console.error(err.stack);
    res.status(500).send("Something went wrong");
});

var user = process.env.USER;
var password = process.env.PASSWORD;
var db = process.env.DB;

const mongoUrl = `mongodb+srv://${user}:${password}@cluster0.npwsk.mongodb.net/${db}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

const shoppingItem = new mongoose.Schema ({
    itemName : String,
    itemQty : Number
});
shoppingItem.set("strictQuery", true);

const SItem = mongoose.model("Item", shoppingItem);

//Estas dos lineas siguientes configura templates que estan en la carpeta de views(Se tiene que llamar así)
app.engine("html",require("ejs").renderFile);
app.set("view engine","ejs");
var shoppingList =[
    {"itemName":"eggs","itemQty":3},
    {"itemName":"milk","itemQty":2},
    {"itemName":"apples","itemQty":4},
    {"itemName":"bread","itemQty":1}
];
var joke = "";
var checked = "";
var user = process.env.USER;
var password = process.env.PASSWORD;
var db = process.env.DB;

/*app.route hace que lo podamos quitar de la declaración
así no estamos repitiendo eso cada que lo hacemos para una
ruta, y así podemos hacer que la ruta sea más corta*/
app.route("/")
    .get((req,res)=>{
        //res.sendFile(__dirname+"/index.html");
//quitamos lo de arriba para poner lo de abajo y así acceder a home.ejs        
        var name = "Jaime";
        var students = [
            {
                "id": 1,
                "name": "Jaime",
                "lastname": "Rincón",
                "age": 20
            },
            {
                "id": 2,
                "name": "Alvaro Samuel",
                "lastname": "Velazquez",
                "age": 22
            }
        ]
        res.render("home",{name, shoppingList, students, joke, checked});
    })
    /*Para unir el form con el js en vez de usar el get method
    usamos el post method para evitar los pedos con el
    get method de arriba*/
    .post((req,res)=>{
        var weight = req.body.weight;
        var height = req.body.height;
        res.send("Your BMI is " + (weight / (height*height)));
    })

app.post("/add",(req,res)=>{
    var newItem = req.body.item;
    var qty = req.body.quantity;

    const item = new SItem({
        itemName : newItem,
        itemQty : qty
    });
    item.save();
    shoppingList.push(item);
    res.redirect("/");
});

/*Para correr el sitio sin tener que matarlo y vovler a
correrlo sigue los pasos que puse en el grupo de sistemas
luego, en la consola de VS escribe npm i -g nodemon
Ya con eso pueden correr el programa como nodemon .\index.js
y ahora cada que guardes un cambio con que refresques la
página ya se va a hacer visible*/
app.get("/about",(req,res)=>{
    res.render("about");
});

app.get("/delete/:idx",(req,res)=>{
    var index = req.params.idx;
    delete shoppingList[index];
    res.redirect("/");
});

app.get("/joke", (req, res) => {
    const url = "https://v2.jokeapi.dev/joke/Any?type=single";
    https.get(url, (response) => {
        var data = "";
        response.on("data", (chunk) => {
            data += chunk;
        });
        response.on("end", () => {
            var jsonObj = JSON.parse(data);
            joke = jsonObj["joke"];
            res.redirect("/")
        });
        response.on("error", (e) => {
            console.error(e);
        });
    });
    form_data.pipe(sRequest);
});

app.post("/check", (req, res) => {
    var word = req.body.word;
    var url = "https://api.toys/api/check_dictionary";
    
    var form_data = new formData();
    form_data.append("text", word);

    const options = {
        method: "POST",
        headers: form_data.getHeaders()
    };

    var sRequest = https.request(url, options, (response) => {
        var data = "";
        response.on("data", (chunk) => {
            data += chunk;
        });
        response.on("end", () => {
            var jsonObj = JSON.parse(data);
            if (jsonObj["found"]){
                checked = jsonObj["found"];
            }else{
                checked = "false"
            }
            //Se puede escribir como checked = jsonObj["found"]?"True":"False"; 
            
            res.redirect("/")
        });
        response.on("error", (e) => {
            console.error(e);
        });
    });
    form_data.pipe(sRequest);
});

app.listen(5000)