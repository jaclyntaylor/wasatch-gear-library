require('reflect-metadata')

const express = require("express");
const postgreSQL = require('./app-data-source');
const { PostgresDriver } = require('typeorm/browser/platform/BrowserDisabledDriversDummy.js');
const app = express();

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static("public"))

app.get("/", (req, res) => {
  res.render('index', {title: 'Dashboard'});
});

postgres.initialize().then(()=>{
    app.listen(3000, () => {
        console.log("Listening on http://localhost:3000");
    });
})
.catch((err)=> {
    console.log('Something went wrong :(', err)
})