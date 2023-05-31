// Otetaan express-moduuli käyttöön
var express = require("express");
var app = express();

// haetaan ympäristömuuttujat .env tiedostosta
require("dotenv").config();

// Otetaan mongoose moduuli käyttöön
var mongoose = require("mongoose");

// Haetaan mongoose_schema model käyttöön
const Movie = require("./modules/model");

//haetaan ympäristömuutjista tietokanta linkki
var uri = process.env.DB_URI;
const PORT = process.env.PORT || 8081;

// Tämä tarvitaan lomakedatan lukemista varten
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


const client = mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Luodaan reitit ja niiden toiminnallisuudet

/* Tulostetaan kaikki leffat */
app.get("/api/leffat", function (req, res) {

    async function connect() {
        try {
            const leffat = await Movie.find({}).limit(10);
            console.log("Leffat haettu...");
            res.status(200).json(leffat);
        } catch (error) {
            res.status(500).json("Yhteysvirhe")
            console.error(`Connection error: ${error.stack} on Worker process: ${process.pid}`)
        } finally {
            console.log("Job done...");
        }
    }
    connect();
});

/* Haetaan leffa _id perusteella */
app.get("/api/hae/:id", function (req, res) {
    var _id = req.params.id;
    async function connect() {
        try {
            const leffat = await Movie.findById(_id);
            res.status(200).json(leffat);
        } catch (error) {
            res.status(500).json("No results")
            console.error('Connection error: ${error.stack} on Worker process: ${process.pid}')
        }
    }
    connect();
});

// Haetaan leffat - nimen (osan) perusteella
app.get("/api/name/:text", async (req, res) => {
    try {
        const text = req.params.text;

        // Etsitään leffat nimen (osan) perusteella
        const leffat = await Movie.find({ title: { $regex: text, $options: "i" } });

        res.status(200).json(leffat);
    } catch (error) {
        res.status(500).json("Virhe leffojen hakemisessa nimen perusteella");
        console.error(`Virhe: ${error.stack}`);
    }
});


// Lisätään yksi leffa - huomaa POST-muuttujien lukeminen
app.post("/api/lisaa", async function (req, res) {
    try {
        // Lue tarvittavat tiedot req.body-objektista
        const title = req.body.title;
        const year = req.body.year;

        // Luodaan uusi elokuva-objekti käyttäen Movie-skeemaa
        const elokuva = new Movie({ title: title, year: year });

        // Tallennetaan elokuva tietokantaan
        await elokuva.save();

        res.status(200).json(elokuva);
    } catch (error) {
        res.status(500).json("Virhe elokuvan lisäämisessä");
        console.error(`Virhe: ${error.stack}`);
    }
});

// Muokataan leffan tietoja id-numeron perusteella. Huomaa ID-arvon lukeminen
app.put("/api/muokkaa/:id", async function (req, res) {
    try {
        const id = req.params.id;
        const title = req.body.title;
        const year = req.body.year;

        // Etsitään elokuva id:n perusteella
        const elokuva = await Movie.findById(id);

        if (!elokuva) {
            return res.status(404).json("Elokuvaa ei löydy");
        }

        // Päivitetään elokuvan tiedot
        elokuva.title = title;
        elokuva.year = year;

        // Tallennetaan päivitetty elokuva tietokantaan
        await elokuva.save();

        res.status(200).json(elokuva);
    } catch (error) {
        res.status(500).json("Virhe elokuvan päivittämisessä");
        console.error(`Virhe: ${error.stack}`);
    }
});

// Poistetaan leffa id:n perusteella. Huomaa ID-arvon lukeminen 
app.delete("/api/poista/:id", async function (req, res) {
    try {
        const id = req.params.id;

        // Etsitään elokuva id:n perusteella ja poistetaan se tietokannasta
        const deletedElokuva = await Movie.findByIdAndDelete(id);

        if (!deletedElokuva) {
            return res.status(404).json("Elokuvaa ei löydy");
        }

        res.status(200).json(deletedElokuva);
    } catch (error) {
        res.status(500).json("Virhe elokuvan poistamisessa");
        console.error(`Virhe: ${error.stack}`);
    }
});


// Web-palvelimen luonti Expressin avulla
app.listen(8081, function () {
    console.log("Kuunnellaan porttia..." + PORT);
});