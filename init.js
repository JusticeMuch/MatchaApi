const fs = require('fs');
const {db, pgp} = require('./db');
const bcrypt = require('bcrypt');

require('dotenv').config();
let data = JSON.parse(fs.readFileSync('users.json'));

// let i = ['chess', 'draught', 'swimming', 'hiking', 'running', 'running away', 'chasing', 'checkers', 'football', 'kamasutra', 'manga', 'anime', 'culture', 'it', 'cricket', 'gyming', 'fitness', 'rugby', 'youtube', 'reddit', 'facebook', 'selfies', 'mindgames', 'poledance', 'dance', 'tennis', 'programming', 'torrenting', 'throwing', 'limping', 'chasing Carl with a cane', 'jogging', 'student', 'flying', 'unemployed', 'need money', 'for hire', 'on sale', 'discount price', 'clearance sale', 'month to live']
// function generateInterests(){
//     let data = [];
//     for (let j = 0; j < 10 ; j++){
//         let p =Math.floor(Math.random() * (i.length - 1));
//         let interest = i[p];
//         if (!data.includes(interest))
//             data.push(interest)
//     }
//     return data;
// }

//     data.forEach(async (element) => {
//         element['location'] = [element.longitude, element.latitude];
//         element.interests = generateInterests();
//         delete element.longitude;
//         delete element.latitude;
//     });


// fs.writeFileSync('users.json', JSON.stringify(data));
module.exports = async function insertDummyProfiles() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(process.env.PG_PASSWORD, salt);

    await db.any('INSERT INTO public."Admin" (id, username, password) VALUES ($1, $2, $3) RETURNING id', [
        process.env.ADMIN_ID, process.env.PG_USERNAME, hash
    ],).then().catch(err => console.log(err));

    cs = new pgp.helpers.ColumnSet([
        'profile_picture',
        'last_visit',
        'description',
        'firstname',
        'lastname',
        'username',
        'email',
        'sexual_preference',
        'sexual_orientation',
        'interests',
        'birthdate',
        'password',
        'location',
        'popularity',
        'gender',
        'authenticated'
    ], {
        table: {
            schema: 'public',
            table: 'Profile'
        }
    });

    const insert = pgp.helpers.insert(data, cs);

    await db.none(insert).then(() => {
        console.log("Dummy profiles inserted")
    }).catch(error => {
        console.log(error);
    });
}
