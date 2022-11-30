const express = require("express");
const exphbs = require("express-handlebars");
const numeral = require("numeral");

const port = process.env.PORT || 3000;

const app = express();
const hbs = exphbs.create({
    partialsDir: "./views/partials",
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.get("/country", (req, res) => {
    fetch(`https://restcountries.com/v3.1/alpha/${req.query.cname}`)
        .then((response) => {
            if (!response.ok) {
                return Promise.reject(`${response.status}: ${response.statusText}`);
            }

            return response.json();
        })
        .then((json) => json[0])
        .then((data) => {
            const countryInfo = {
                name: data.translations.por.common,
                officialName: data.translations.por.official,
                code: req.query.cname.toUpperCase(),
                capitals: data.capital ? String([...data.capital]).replace(/,/g, ", ") : "Sem capital",

                flag: data.flags.svg,

                currency: data.currencies ? data.currencies[Object.keys(data.currencies)[0]].name : null,
                currency_initials: data.currencies ? Object.keys(data.currencies)[0] : null,
                currency_symbol: data.currencies ? data.currencies[Object.keys(data.currencies)[0]].symbol : null,

                continent: data.region,
                region: data.subregion,
                latitude: data.latlng[0].toFixed(),
                longitude: data.latlng[1].toFixed(),
                area: numeral(data.area).format("0.000a"),
                population: numeral(data.population).format("0.0a"),
                borders: data.borders ?  String([...data.borders]).replace(/,/g, ", ") : false,

                languages: data.languages ? data.languages : ["Sem idioma oficial"],

                timezones: String([...data.timezones]).replace(/,/g, ", "),
            };

            return countryInfo;
        })
        .then((result) => res.render("country", { data: result }))
        .catch((err) => {
            console.log(err);
            res.redirect("/404");
        });
});

app.get("/", (req, res) => res.render("home"));

app.use((req, res, next) => {
    res.status(404);

    res.render("error");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
