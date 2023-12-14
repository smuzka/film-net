const express = require('express');
const bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');

const app = express();

// // Konfiguracja połączenia z Neo4j
// const driver = neo4j.driver('neo4j+s://8a98a84a.databases.neo4j.io', neo4j.auth.basic('neo4j', 'UFOKbg3GfON7t1qg8_d1q41HMoiYODAaOBVUftrbAxM'));
// const session = driver.session();
//
// // Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Ścieżki
app.get('/', async (req, res) => {
    // try {
    //     const films = await session.run('MATCH (f:Film) RETURN f');
    //     const users = await session.run('MATCH (f:User) RETURN f');
    //     const userRatings = await session.run(`
    //         MATCH (u:User)-[r:Rate]->(f:Film)
    //         RETURN u.userName, f.title, r.rating
    //     `);
    //
    //     res.render('index', {
    //         films: films.records.map(record => record.get('f').properties),
    //         users: users.records.map(record => record.get('f').properties),
    //         userRatings: userRatings.records.map(record => ({
    //             userName: record.get('u.userName'),
    //             title: record.get('f.title'),
    //             rating: record.get('r.rating')
    //         }))
    //     });
    // } catch (error) {
    //     console.error('Błąd przy pobieraniu danych:', error);
    //     res.status(500).send('Błąd serwera');
    // }
    res.render('test');
});

// ... Obsługa formularzy ...


const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", function () {
    console.log('Serwer działa');
});


// // Obsługa dodawania użytkownika
// app.post('/addUser', (req, res) => {
//     const { username, email } = req.body;
//     session.run('CREATE (u:User {userName: $username, email: $email}) RETURN u', { username, email })
//            .then(() => res.redirect('/'))
//            .catch(error => console.error(error));
// });
//
// // Obsługa dodawania filmu
// app.post('/addMovie', (req, res) => {
//     const { title, year, genre } = req.body;
//     const query = 'CREATE (f:Film {title: $title, year: $year, category: $genre}) RETURN f';
//
//     session.run(query, {
//         title,
//         year: parseInt(year), // Przekształć rok na liczbę całkowitą
//         genre
//     })
//            .then(() => res.redirect('/'))
//            .catch(error => {
//                console.error('Błąd przy dodawaniu filmu:', error);
//                res.status(500).send('Błąd serwera');
//            });
// });
//
// // Obsługa dodawania oceny
// app.post('/addRating', (req, res) => {
//     const { username, title, rating } = req.body;
//     const query = `
//         MATCH (u:User {userName: $username}),
//               (f:Film {title: $title})
//         CREATE (u)-[:Rate {rating: $rating, ratingDate: date()}]->(f)
//         RETURN u, f`;
//
//     session.run(query, { username, title, rating: parseInt(rating) })
//            .then(() => res.redirect('/'))
//            .catch(error => console.error(error));
// });
//
