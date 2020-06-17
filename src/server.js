const express = require("express")
const server = express()
const db = require("./database/db.js")

// Configurar pasta public.
server.use(express.static("public"))

// Habilitar o uso do req.body.
server.use(express.urlencoded({ extended: true }))


// Template engine.
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// CONFIGURAR CAMINHOS

// index.html
server.get("/", (req, res) => {
    return res.render("index.html", { title: "Um título" })
})

// create-point.html
server.get("/create-point", (req, res) => {


    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    //req.body: O corpo do nosso formulario
    //console.log(req.body)

    // Inserir dados na tabela
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);

    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true })

    }

    db.run(query, values, afterInsertData)

})

// search-results.html
server.get("/search", (req, res) => {

    const search = req.query.search

    if (search == "") {
        //Pesquisa vazia.
        return res.render("search-results.html", { total: 0 })
    }


    //Pegar os dados do DB.
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        const total = rows.length

        // Mostrar a página html com os dados do DB.
        return res.render("search-results.html", { places: rows, total: total })
    })
})

//Ligar o server.
server.listen(3000)