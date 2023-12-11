const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');

const app = express();

// Konfiguracja połączenia z Neo4j
const driver = neo4j.driver('neo4j+s://8a98a84a.databases.neo4j.io', neo4j.auth.basic('neo4j', 'UFOKbg3GfON7t1qg8_d1q41HMoiYODAaOBVUftrbAxM'));
const session = driver.session();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ścieżki
app.get('/', async (req, res) => {
    try {
        const filmy = await session.run('MATCH (f:Film) RETURN f');
        const uzytkownicyIOceny = await session.run(`
            MATCH (u:Uzytkownik)-[r:OCENIA]->(f:Film)
            RETURN u.nazwaUzytkownika, f.tytul, r.ocena
        `);

        res.render('index', {
            filmy: filmy.records.map(record => record.get('f').properties),
            uzytkownicyIOceny: uzytkownicyIOceny.records.map(record => ({
                nazwaUzytkownika: record.get('u.nazwaUzytkownika'),
                tytulFilmu: record.get('f.tytul'),
                ocena: record.get('r.ocena')
            }))
        });
    } catch (error) {
        console.error('Błąd przy pobieraniu danych:', error);
        res.status(500).send('Błąd serwera');
    }
});

// ... Obsługa formularzy ...

app.listen(3000, () => {
    console.log('Serwer działa na porcie 3000');
});

// Obsługa dodawania użytkownika
app.post('/addUser', (req, res) => {
    const { username, email } = req.body;
    session.run('CREATE (u:Uzytkownik {nazwaUzytkownika: $username, email: $email}) RETURN u', { username, email })
           .then(() => res.redirect('/'))
           .catch(error => console.error(error));
});

// Obsługa dodawania filmu
app.post('/addMovie', (req, res) => {
    const { title, year, genre } = req.body;
    const query = 'CREATE (f:Film {tytul: $title, rokWydania: $year, gatunek: $genre}) RETURN f';

    session.run(query, {
        title,
        year: parseInt(year), // Przekształć rok na liczbę całkowitą
        genre
    })
           .then(() => res.redirect('/'))
           .catch(error => {
               console.error('Błąd przy dodawaniu filmu:', error);
               res.status(500).send('Błąd serwera');
           });
});

// Obsługa dodawania oceny
app.post('/addRating', (req, res) => {
    const { username, title, rating } = req.body;
    const query = `
        MATCH (u:Uzytkownik {nazwaUzytkownika: $username}), 
              (f:Film {tytul: $title})
        CREATE (u)-[:OCENIA {ocena: $rating, dataOceny: date()}]->(f)
        RETURN u, f`;

    session.run(query, { username, title, rating: parseInt(rating) })
           .then(() => res.redirect('/'))
           .catch(error => console.error(error));
});

