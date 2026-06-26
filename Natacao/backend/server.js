const express = require("express");
const cors = require("cors");
const mysql = require("mysql2")
let erros=0;
let block = false
 
const app = express();
app.use(cors());
app.use(express.json());
 
const db = mysql.createConnection({
    host:process.env.DB_HOST || "localhost",
    user:process.env.DB_USER || "root",
    password:process.env.DB_PASSWORD || "",
    database:process.env.DB_NAME || "natacao",
    port:process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST? {rejectUnauthorized:
    false} : null
});
 
 db.connect((erro) => {
    if(erro) {
        console.log("Erro ao conectar");
        console.log(erro);
        return;
    }
     console.log("Conectado com sucesso");
     const criartabelaSQL = `
     CREATE TABLE IF NOT EXISTS alunos1 (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nome VARCHAR(100) NOT NULL,
     idade  INT NOT NULL,
     nivel VARCHAR(50) NOT NULL,
     horario VARCHAR(50) NOT NULL,
     ativo BOOLEAN DEFAULT TRUE
     );
     `;
     db.query(criartabelaSQL, (errotabela) => {
        if (errotabela) {
            console.log("erro de verificacao ou criacao de tabela",errotabela);
        } else {
            console.log("tabela pronta para usar");
        }
     })
 });
 
 
 
app.get("/", (req, res) => {
    res.json({
        mensagem: "API funcionando"
    })
})
 
app.post("/alunos", (req,res) => {
    const {
        nome, idade, nivel, horario
    } = req.body
 
    if (!nome || !idade || !nivel || !horario ) {
        return res.status(400).json({
            erro: "Preencha todos os campos."
        })
    }
 
        if (idade < 5) {
            return res.status(400).json({
                erro: "Aluno abaixo da idade permitida."
            })
        }
 
        if (idade > 100) {
            return res.status(400).json({
                erro: "Aluno acima da idade permitida."
            })
        }
 
                if (nome.length < 3) {
            return res.status(400).json({
                erro: "Menos de 3 letras no nome não são permitidas"
            })
        }
 
        const verificaSQL = "SELECT * FROM alunos1 WHERE nome = ?";
        db.query(verificaSQL, [nome],
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json(erro);
            }
            if (resultado.lenght > 0) {
                return res.status(400).json({
                    erro: "Já existe este nome cadastrado no banco"
                })
            }
            const inserirSQL = 'insert into alunos1 (nome, idade, nivel, horario) values(?, ?, ?, ?, ?)'
            db.query (inserirSQL, [nome, idade, nivel, horario], (erro,resultado) => {
                if (erro) {
                    return res.status(500).json(erro);
                }
                res.status(201).json({
                    mensagem: "Aluno caastrado",
                    id: resultado.insertId
                })
            })
        })
    })
 
    app.get("/alunos", (req,res) => {
        db.query(
            "SELECT * FROM alunos1", (erro, resultado) => {
                if(erro) {
                    return res.status(500).json(erro);
                }
                res.json(resultado);
            });
    });
 
    app.delete("/alunos/:id", (req, res) =>{
       const id = req.params.id;
     db.query("DELETE FROM alunos1 where id = ?", [id], (erro, resultado) => {
        if(erro) {
 return res.status(500).json(erro);
        } if (resultado.affectedRows === 0) {
           return res.status(404).json({
            erro:"Aluno não encontrado"
           })
        }
        res.json({
            mensagem: "Aluno removido"
        });
 
     });
    });
   
    app.put("/alunos/:id", (req, res) => {
        const id = Number(req.params.id)
        db.query("SELECT ativo FROM alunos1 WHERE id = ?", [id], (erro, resultado) => {
            if (erro) {
                return res.status(500).json(erro);
            }
            if (resultado.lenght === 0) {
                return res.status(404).json({
                    erro: 'Aluno não encontrado'
                })
            }
            const novoStatus = resultado[0].ativo ? 0 : 1;
            db.query("UPDATE alunos1 SET ativo = ? WHERE id = ?", [novoStatus, id], (erro) => {
                if (erro){
                    return res.status(500).json(erro);
                }
                res.json({
                    mensagem: "Aluno atualizado"
                })
            })
        })
    })
    if (block===false){
    app.post ("/admin", (req, res) => {
        const {senha} = req.body;
        if(!senha){
            return res.status(400).json({
                erro: "Informe a senha."
            })
        }
       
          if (erros>=3){
            block=true
        }
 
        if(senha === "a" && erros<3){
            erros = 0
            return res.json({autenticado: true});
           
           
        }
 
        else{
            erros++
              return res.status(401).json({
            erro: "Erro!"
        })
 
     
         
           
        }
    })
    }



    const PORT = process.env.PORT || 3000;
    app.listen(3000, () => {
        console.log("Servidor rodando em: ")
        console.log(`porta ${PORT}`)
    })
 
