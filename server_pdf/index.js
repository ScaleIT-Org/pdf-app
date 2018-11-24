var express = require('express'),
    fs = require('fs'),
    app = express(),
    sqlite3 = require('sqlite3').verbose();

const IncomingForm = require('formidable').IncomingForm;

app.get('/list', function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    getL(res)
        
        
});
  
function getL(res) {   
    let db = new sqlite3.Database('./db/names.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    var ar = [];
    db.each("SELECT rowid AS id, name FROM names", function(err, row) {
        ar.push(row.name)
        console.log(row.id + ": " + row.name);        
    }, function(err, n) {
        res.send(ar);
    });
    db.close();
}


app.get('/:id', function (req, res) {
    var id = req.params.id;
    console.log(id);
    var filePath = "/files/" + id + ".pdf";
    res.header("Access-Control-Allow-Origin", "*");
    
    fs.readFile(__dirname + filePath, function (err, data) {
        res.contentType("application/pdf");
        res.header('content-type', 'application/pdf');
        res.send(data);
    });
});

app.get('/rm/:name', function (req, res) {
    console.log("i remove")
    res.header("Access-Control-Allow-Origin", "*");

    var name = req.params.name;
    let db = new sqlite3.Database('./db/names.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
    db.run(`DELETE FROM names WHERE name=?`, name, function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) deleted ${this.changes}`);
      });

    
});

app.post('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var form = new IncomingForm();

    form.on('file', (field, file) => {
        let db = new sqlite3.Database('./db/names.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
            }
        console.log('Connected to the database.');
    });
    fileName = file.name + '__' + Date.now()


    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS names (name TEXT)");

        var stmt = db.prepare("INSERT INTO names VALUES (?)");
        stmt.run(fileName);
        stmt.finalize();

        db.each("SELECT rowid AS id, name FROM names", function (err, row) {
            console.log(row.id + ": " + row.name);
        });

    });

    db.close();
        var filePath = __dirname + '/files/' + fileName + '.pdf';
        fs.readFile(file.path, (err, data) => {
            fs.appendFile(filePath, data, function () {
            });
        });
    });

    form.on('end', () => {
        res.send({ 'result': 'File upload' });
    });
    form.on('error', () => {
        res.status(500).send({ 'status': 'File not upload' });
    });
    form.parse(req);

});




app.listen(3000, function () {
    console.log('Listening on 3000');
});