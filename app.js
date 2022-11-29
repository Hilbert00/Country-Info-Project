const express = require("express");
const exphbs = require("express-handlebars");
const numeral = require("numeral");

const port = process.env.PORT || 3001;

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
                capitals: data.capital,

                flag: data.flags.svg,

                currency: data.currencies[Object.keys(data.currencies)[0]].name,
                currency_initials: Object.keys(data.currencies)[0],
                currency_symbol: data.currencies[Object.keys(data.currencies)[0]].symbol,

                continent: data.region,
                region: data.subregion,
                latitude: data.latlng[0].toFixed(),
                longitude: data.latlng[1].toFixed(),
                area: numeral(data.area).format("0.000a"),
                population: numeral(data.population).format("0.0a"),
                borders: data.borders || "",

                languages: data.languages,

                timezones: String([...data.timezones]).replace(/,/g, ", "),
            };

            if (countryInfo.borders != "") {
                countryInfo.hasBorder = true;
                countryInfo.borders = String([...data.borders]).replace(/,/g, ", ");
            } else {
                countryInfo.hasBorder = false;
            }

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

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`;
