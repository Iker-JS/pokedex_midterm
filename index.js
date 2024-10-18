require("dotenv").config();
const express = require('express');
const app = express();
const https = require('https');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Función para obtener datos de Pokémon
const fetchPokemonData = (pokemonName, callback) => {
    https.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            if (apiRes.statusCode === 200) {
                const pokemonData = JSON.parse(data);
                callback(null, pokemonData);
            } else {
                callback(new Error('Pokémon no encontrado'), null);
            }
        });
    }).on('error', (err) => {
        console.error('Error: ' + err.message);
        callback(new Error('Error interno del servidor'), null);
    });
};

// Ruta principal
app.route("/")
    .get((req, res) => {
        // Obtener datos de Bulbasaur al cargar la página
        fetchPokemonData('bulbasaur', (err, pokemonData) => {
            if (err) {
                res.render("home", { pokemonData: null, error: err.message });
            } else {
                res.render("home", { pokemonData: pokemonData, found: true });
            }
        });
    });

// Ruta para buscar Pokémon
app.post('/search', (req, res) => {
    const pokemonName = req.body.name; 
    https.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`, (apiRes) => {
        let data = '';
        let found = false;

        apiRes.on('data', (chunk) => {
            data += chunk;
        });
        apiRes.on('end', () => {
            if (apiRes.statusCode == 200) {
                found = true;
                const pokemonData = JSON.parse(data);
                res.render("home", { pokemonData: pokemonData, found });
            } else {
                res.render("home", { pokemonName, found });
            }
        });
    }).on('error', (err) => {
        console.error('Error: ' + err.message);
        res.status(500).render("home", { pokemonData: null, error: 'Error interno del servidor' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 5000');
});