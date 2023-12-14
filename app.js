const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');

const app = express();

// Konfiguracja połączenia z Neo4j
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASSWORD));
const session = driver.session();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function () {
    console.log('Serwer działa');
});

// Ścieżki
app.get('/', async (req, res) => {
    try {
        const films = await session.run('MATCH (f:Film) RETURN f, ID(f)');
        const users = await session.run('MATCH (u:User) RETURN u, ID(u)');
        const userRatings = await session.run(`
            MATCH (u:User)-[r:Rate]->(f:Film)
            RETURN u.userName, f.title, r.rating, ID(r)
        `);

        res.render('index', {
            films: films.records.map(record => {
                return {
                    id: record.get("ID(f)"),
                    properties: record.get("f").properties,
                }
            }),
            users: users.records.map(record => {
                return {
                    id: record.get("ID(u)"),
                    properties: record.get("u").properties,
                }
            }),
            userRatings: userRatings.records.map(record => {
                return {
                    userName: record.get('u.userName'),
                    title: record.get('f.title'),
                    rating: record.get('r.rating'),
                    ratingId: record.get('ID(r)'),
                }
            }),
        });
    } catch (error) {
        console.error('Błąd przy pobieraniu danych:', error);
        res.status(500).send('Błąd serwera');
    }
});


// ... Obsługa formularzy ...

// Obsługa dodawania użytkownika
app.post('/addUser', (req, res) => {
    const { username, email } = req.body;
    session.run('CREATE (u:User {userName: $username, email: $email}) RETURN u', { username, email })
           .then(() => res.redirect('/'))
           .catch(error => console.error(error));
});

// Obsługa dodawania filmu
app.post('/addMovie', (req, res) => {
    const { title, year, genre } = req.body;
    const query = 'CREATE (f:Film {title: $title, year: $year, category: $genre}) RETURN f';

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
        MATCH (u:User {userName: $username}),
              (f:Film {title: $title})
        CREATE (u)-[:Rate {rating: $rating, ratingDate: date()}]->(f)
        RETURN u, f`;

    session.run(query, { username, title, rating: parseInt(rating) })
           .then(() => res.redirect('/'))
           .catch(error => console.error(error));
});

app.post('/deleteMovie', (req, res) => {
    const movieId = req.body.movieId;
    session.run(`MATCH (f:Film) WHERE ID(f) = ${ parseInt(movieId) } DETACH DELETE f`)
           .then(() => res.redirect('/'))
           .catch(error => {
               console.error('Błąd przy usuwaniu filmu:', error);
               res.status(500).send('Błąd serwera');
           });
});

app.post('/deleteUser', (req, res) => {
    const userId = req.body.userId;
    session.run(`MATCH (u:User) WHERE ID(u) = ${ parseInt(userId) } DETACH DELETE u`)
           .then(() => res.redirect('/'))
           .catch(error => {
               console.error('Błąd przy usuwaniu użytkownika:', error);
               res.status(500).send('Błąd serwera');
           });
});

app.post('/deleteRating', (req, res) => {
    const ratingId = req.body.ratingId;
    session.run(`MATCH ()-[r]-() WHERE ID(r) = ${ ratingId } DELETE r`)
           .then(() => res.redirect('/'))
           .catch(error => {
               console.error('Błąd przy usuwaniu oceny:', error);
               res.status(500).send('Błąd serwera');
           });
});
