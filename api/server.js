const express = require('express'), bodyParser = require('body-parser'), mongodb = require('mongodb'),
    objectId = require('mongodb').ObjectID
const app = express() 

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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
    const dados = req.body

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

// PUT by id (update)
app.put('/api/:id', (req, res) => {
    id = objectId(req.params.id)

    db.open((err,mongoclient) => {
        mongoclient.collection('postagens', (err,collection) => {
            collection.update(
                { _id: id },
                { $set : req.body },
                {},
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

// DELETE by id (update)
app.delete('/api/:id', (req, res) => {
    id = objectId(req.params.id)

    db.open((err,mongoclient) => {
        mongoclient.collection('postagens', (err,collection) => {
            collection.remove({ _id : id }, (err, records) => {
                if(err){
                    res.json(err)
                }else{
                    res.json(records)
                }
            }) 
            mongoclient.close()
        })
    })
})