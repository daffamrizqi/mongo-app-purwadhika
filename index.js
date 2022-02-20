const express = require('express')
const cors = require('cors')

const PORT = 4400;
const app = express()

app.use(cors())
app.use(express.json())

// import method dari lib mogodb
let { MongoClient, ObjectId } = require('mongodb')
// url connetion to MongoDB cloud
let url = "mongodb+srv://daffaMongo:naufal11@cluster0.jnebh.mongodb.net/kantor?retryWrites=true&w=majority"

// test connection to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true } ,(err, client) => {
    if (err) {
        console.log(err)
    }
    console.log(`Connected to MongoDB cloud`)
})

app.get('/', (req, res) => {
    try {
        res.statusMessage(200).send(`<h3>Integrating mongo with express</h3>`)
    } catch(err) {
        res.status(400).send(err)
    }
})

// creating data karyawan
app.post('/add-data', (req, res) => {
    MongoClient.connect(url, { useUnifiedTopology: true } ,(err, client) => {
        // define database yang ingin di akses
        const db = client.db('kantor')
        // memilih collection(table) yang ingin diakses
        db.collection('karyawan').insertMany([req.body], (err, result) => {
            try {
                console.log(`Insert data success: ${result}`)
                res.status(200).send(result)
            } catch (err) {
                res.status(500).send(err)
                console.log(err)
            }
            
        })
    })
})

// read data karyawan (basic)
app.get('/get-data', (req, res) => {
    MongoClient.connect(url, (err, client) => {
        // define database yang ingin diakses
        const db = client.db('kantor')
        // collection(table) yang ingin diakses
        db.collection('karyawan').find({...req.query}).toArray((err, docs) => { // jika req.query diisi maka akan menampilkan data yang diinginkan dan jika kosong akan menampilkan seluruh data
            try {
                res.status(200).send(docs)
            } catch(err) {
                res.status(500).send(err)
                console.log(err)
            }
        })
    })
})

// get data dengan sorting dan limiting
app.get('/get-data-sortLimit', (req, res) => {
    MongoClient.connect(url, (err, client) => {
        // define databae yang ingin di akses
        const db = client.db('kantor')
        // sort  :   1 ASCENDING
        // sort  :  -1 DESCENDING
        // limit :  banyaknya data yang ingin di-get
        // skip  :  banyaknya daya yang ingin di skip dari data pertama
        db.collection('karyawan').find({}).sort({usia:1}).limit(5).skip(2).toArray((err, docs) => {
            try {
                res.status(200).send(docs)
            } catch(err) {
                res.status(500).send(err)
                console.log(err)
            }
        })
    })
})

// read data karyawan (filtering)
app.get('/filter-data', (req, res) => {
    MongoClient.connect(url, (err, client) => {
        // define database yang ingin diakses
        const db = client.db('kantor')
        db.collection('karyawan').find({usia:{$lt:25}}).toArray((err, docs) => { // lt: lower than, gt: greater than
            try {
                res.status(200).send(docs)
            } catch(err) {
                res.status(500).send(err)
                console.log(err)
            }
        })
    })
})

// read data dengan grouping
app.get('/group-data', (req, res) => {
    MongoClient.connect(url, (err, client) => {
        const db = client.db('kantor')
        db.collection('karyawan').aggregate([
            {
                $group:{
                    _id:'$kota', // _id adalah properties data mana yang akan di grouping
                    count: {$sum:1}, // setiap grouping data kota akan ditambahkan satu
                    avgUsia: {$avg: '$usia'}
                }
            }
        ]).toArray((err, docs) => {
            try {
                res.status(200).send(docs)
            } catch(err) {
                res.status(500).send(err)
                console.log(err)
            }
        })
    })
})

// update data
app.patch('/update-data', (req, res) => {
    // connect
    MongoClient.connect(url, (err, client) => {
        const db = client.db('kantor')
        // updateOne( param filter data, query untuk melakukan update data )
        db.collection('karyawan').updateOne({...req.query}, {$set: {...req.body}}, (err, result) => {
            try {
                res.status(200).send(result)
            } catch (error) {
                res.status(500).send(err)
                console.log(err)
            }
        }) // notes: ketika melakukan req.body nama prop harus sama dengan nama prop yang ada pada collection mongoDB
    })
})

// delete data
app.delete('/delete', (req, res) => {
    MongoClient.connect(url, (err, client) => {
        // define database
        const db = client.db('kantor')
        db.collection('karyawan').deleteOne({...req.query}, (err, results) => {
            try {
                res.status(200).send(results)
            } catch (err) {
                res.status(500).send(err)
                console.log(err);
            }
        })
    })
})

app.listen(PORT, () => console.log(`API mongo running: ${PORT}`))