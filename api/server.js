const   express = require('express'), 
        bodyParser = require('body-parser'), 
        multparty = require('connect-multiparty'),
        mongodb = require('mongodb'),
        objectId = require('mongodb').ObjectID, 
        fs = require('fs');

const app = express() 

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(multparty())
app.use((req,res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE') //GET, POST, PUT, DELETE (HABILITA CHAAMDAS INDEPENDENTE DA ORIGEM)
    res.setHeader('Access-Control-Allow-Headers','content-type')
    res.setHeader('Access-Control-Allow-Credentials',true)
    next()
})

app.listen(8080)
const db = new mongodb.Db(
    'instagram', 
    new mongodb.Server('localhost', 27017, {}),
    {}
)

app.get('/', (req, res) => {
    res.send({msg: 'ok'})
})


//URI + VERBO HTTP
//INSERT
app.post('/api', (req, res) => {

    
    

    const path_origem = req.files.arquivo.path
    const path_destino = './uploads/' + req.files.arquivo.originalFilename
    fs.rename(path_origem, path_destino, (err) => {
        if(err){
            res.status(500).json({error: err})
        }else{

            const dados = {
                url_imagem: req.files.arquivo.originalFilename,
                titulo: req.body.titulo
            }

            db.open((err,mongoclient) => {
                mongoclient.collection('postagens', (err,collection) => {
                    collection.insert(dados, (err, records) => {
                        if(err){
                            res.json(err)
                        }else{
                            res.json(records)
                        }
                        mongoclient.close()
                    })
                })
            })
        }
    })
})

//SELECT *
app.get('/api', (req, res) => {
    db.open((err,mongoclient) => {
        mongoclient.collection('postagens', (err,collection) => {
            collection.find().toArray((err, results) => {
                if(err){
                    res.json(err)
                }else{
                    res.json(results)
                }
                mongoclient.close()
            })
        })
    })
})

//SELECT * (WHERE ID = ) / GET ID
app.get('/api/:id', (req, res) => {
    id = objectId(req.params.id)

    db.open((err,mongoclient) => {
        mongoclient.collection('postagens', (err,collection) => {
            collection.find(objectId(id)).toArray((err, results) => {
                if(err){
                    res.json(err)
                }else{
                    res.status(200).json(results)
                }
                mongoclient.close()
            })
        })
    })
})

app.get('/imagens/:imagem', (req, res) => {
  const img = req.params.imagem  
  fs.readFile('./uploads/'+img, (err, content) => {
    if(err){
        res.status(400).json(err)
        return
    }
    res.writeHead(200, {'content-type' : 'image/jpg'})
    res.end(content) //escreve o parâmetro dentro do result
  })
})

// PUT by id (update)
app.put('/api/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin','*')

    id = objectId(req.params.id)
    db.open((err,mongoclient) => {
        mongoclient.collection('postagens', (err,collection) => {
            collection.update(
                { _id : id },
                { 
                    $push : {
                        comentarios: {
                            id_comentario : new objectId(),
                            comentario: req.body.comentario
                        }
                    } 
                },
                (err, records) => {
                    if(err){
                        res.json(err)
                    }else{
                        res.json(records)
                    }
                }
            ) 
            mongoclient.close()
        })
    })
})

// // DELETE by id (update)
// app.delete('/api/:id', (req, res) => {
//     id = objectId(req.params.id)

//     db.open((err,mongoclient) => {
//         mongoclient.collection('postagens', (err,collection) => {
//             collection.remove({ _id : id }, (err, records) => {
//                 if(err){
//                     res.json(err)
//                 }else{
//                     res.json(records)
//                 }
//             }) 
//             mongoclient.close()
//         })
//     })
// })

// DELETE by id (update)
app.delete('/api/:id', (req, res) => {
    id = objectId(req.params.id)
    db.open((err,mongoclient) => {
        mongoclient.collection('postagens', (err,collection) => {
            collection.update(
                { },
                { 
                    $pull : {
                        comentarios: { id_comentario : id }
                    } 
                },
                { multi : true },
                (err, records) => {
                    if(err){
                        res.json(err)
                    }else{
                        res.json(records)
                    }
                }
            ) 
            mongoclient.close()
        })
    })
})