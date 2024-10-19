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
const fetchPokemonData = (pokemonIdentifier, callback) => {
    https.get(`https://pokeapi.co/api/v2/pokemon/${pokemonIdentifier}`, (apiRes) => {
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

// Función para obtener el siguiente o anterior Pokémon
const getAdjacentPokemon = (currentId, direction) => {
    let newId = currentId + direction;
    if (newId < 1) newId = 1025;
    if (newId > 1025) newId = 1;
    return newId;
};

app.route("/")
    .get((req, res) => {
        res.render("home", { title: 'Welcome to The JS Pokedex' });
    });

app.route("/about")
    .get((req, res) => {
        const pokemonId = req.query.id || 1;
        fetchPokemonData(pokemonId, (err, pokemonData) => {
            if (err) {
                res.render("about", { pokemonData: null, error: err.message, title: 'About The JS Pokedex' });
            } else {
                res.render("about", { pokemonData: pokemonData, found: true, title: 'About The JS Pokedex' });
            }
        });
    });

app.post('/search', (req, res) => {
    const pokemonName = req.body.name; 
    fetchPokemonData(pokemonName, (err, pokemonData) => {
        if (err) {
            res.render("about", { pokemonData: null, error: err.message, title: 'About The JS Pokedex' });
        } else {
            res.render("about", { pokemonData: pokemonData, found: true, title: 'About The JS Pokedex' });
        }
    });
});

app.post('/navigate', (req, res) => {
    const direction = req.body.direction === 'next' ? 1 : -1;
    console.log(req.body.currentId)
    const currentId = parseInt(req.body.currentId) || 1;
    const newId = getAdjacentPokemon(currentId, direction);
    
    fetchPokemonData(newId, (err, pokemonData) => {
        if (err) {
            res.render("about", { pokemonData: null, error: err.message, title: 'About The JS Pokedex' });
        } else {
            res.render("about", { pokemonData: pokemonData, found: true, title: 'About The JS Pokedex' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});