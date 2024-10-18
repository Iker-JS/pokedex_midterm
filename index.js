require("dotenv").config();

const express = require('express');
const app = express();
const https = require('https');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Home route
app.route("/")
    .get((req, res) => {
        // Render the home page with an empty joke initially
        res.render("home", { joke: "" });
    });

// New route for searching Pokémon
app.post('/search', (req, res) => {
    const pokemonName = req.body.name; // Get the Pokémon name from the request body

    // Call the PokeAPI to search for the Pokémon
    https.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`, (apiRes) => {
        let data = '';

        // A chunk of data has been received
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received
        apiRes.on('end', () => {
            if (apiRes.statusCode === 200) {
                const pokemonData = JSON.parse(data);
                // Send the Pokémon data back to the frontend, including the ID
                res.json({
                    id: pokemonData.id,
                    name: pokemonData.name,
                    types: pokemonData.types,
                    abilities: pokemonData.abilities,
                    moves: pokemonData.moves
                });
            } else {
                // Handle Pokémon not found
                res.status(apiRes.statusCode).json({ error: 'Pokémon not found' });
            }
        });
    }).on('error', (err) => {
        console.error('Error: ' + err.message);
        res.status(500).json({ error: 'Internal server error' });
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 3000');
});