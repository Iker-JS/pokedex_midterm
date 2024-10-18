require("dotenv").config();
const express = require('express');
const app = express();
const https = require('https');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Para servir archivos estáticos
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Ruta principal
app.route("/")
    .get((req, res) => {
        res.render("home", { pokemonData: null }); // Renderizar la página de inicio
    });

// Ruta para buscar Pokémon
app.post('/search', (req, res) => {
    const pokemonName = req.body.name; // Obtener el nombre del Pokémon del formulario

    // Llamar a la PokeAPI para buscar el Pokémon
    https.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`, (apiRes) => {
        let data = '';
        let found = false;

        // Recibir los datos
        apiRes.on('data', (chunk) => {
            data += chunk;
        });
        // Cuando se reciben todos los datos
        apiRes.on('end', () => {
            
            if (apiRes.statusCode == 200) {
                found = true;
                const pokemonData = JSON.parse(data);
                // Renderizar la página de inicio con los datos del Pokémon
                res.render("home", { joke: "", pokemonData: pokemonData, found});

            } else {
                // Manejar Pokémon no encontrado
                res.render("home", { joke: "", pokemonName, found});
            }
        });
    }).on('error', (err) => {
        console.error('Error: ' + err.message);
        res.status(500).render("home", { joke: "", pokemonData: null, error: 'Error interno del servidor' });
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});