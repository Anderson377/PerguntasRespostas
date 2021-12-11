//Imports

const express = require("express")
const res = require("express/lib/response")
const app = express()
//Para receber os dados inseridos pelo usuario
const bodyParser = require("body-parser")
//Chamda do SGBD
const connection = require("./dataBase/database")
const Pergunta = require("./dataBase/Pergunta")
const Resposta = require("./dataBase/Resposta")
const req = require("express/lib/request")

//DataBase
connection
  .authenticate()
  .then(() => {
    console.log("Conexao feita com o banco de dados")
  })
  .catch((msgErro) => {
    console.log(msgErro)
  })

// Estou dizendo para o express usar o EJS como view engine
app.set("view engine", "ejs")
app.use(express.static("public"))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//ROTAS
app.get("/", (req, res) => {
  //Equivalente ao SQL SELECT * ALL FROM pergunta
  Pergunta.findAll({
    raw: true,
    //Ordenação
    order: [
      ["id", "DESC"], // ACS => crescente DESC => decrescente
    ],
  }).then((perguntas) => {
    res.render("index", {
      perguntas: perguntas,
    })
  })
})

app.get("/perguntar", (req, res) => {
  res.render("perguntar")
})

app.post("/salvarpergunta", (req, res) => {
  //Para pegar as informações do front
  var titulo = req.body.titulo

  //Para salvar no banco de dados
  var descricao = req.body.descricao
  Pergunta.create({
    titulo: titulo,
    descricao: descricao,
  }).then(() => {
    res.redirect("/")
  })
})

app.get("/pergunta/:id", (req, res) => {
  var id = req.params.id
  Pergunta.findOne({
    where: { id: id },
  }).then((pergunta) => {
    if (pergunta != undefined) {
      Resposta.findAll({
        where: { perguntaId: pergunta.id },
        order: [["id", "DESC"]],
      }).then((respostas) => {
        res.render("pergunta", {
          pergunta: pergunta,
          respostas: respostas,
        })
      })
    } else {
      //Pergunta nao encontrada
      res.redirect("/")
    }
  })
})

app.post("/responder", (req, res) => {
  var corpo = req.body.corpo
  var perguntaId = req.body.pergunta
  Resposta.create({
    corpo: corpo,
    perguntaId: perguntaId,
  }).then(() => {
    //Para redirecionar para a pagina pergunta
    res.redirect("/pergunta/" + perguntaId)
  })
})

app.listen(8080, () => {
  console.log("App rodando!")
})
