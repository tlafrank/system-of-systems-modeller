
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const select = require('./helpers/select');
const graph = require('./helpers/graph');
const update = require('./helpers/update');
const backup = require('./helpers/backup');



const images = require('./helpers/images');
const fs = require('fs');


app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream('index.html').pipe(res);
})


app.use('/images', express.static('images'));
app.use('/assets', express.static('assets'));

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/classes', express.static('classes'));


app.use(bodyParser.urlencoded({ extended: true }));

//Add or update nodes and features
//app.post('/update.json', platform.update);
app.post('/update.json', update.switch);



//Basic select statements
app.post('/select.json', select.switch)
app.post('/graph.json', graph.switch)

//Generate all the insert statements required to replicate the database
app.get('/backup.txt', backup.run)

app.get('/images.json', images.getImages);

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
})



