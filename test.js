const fs = require('fs');
const {db, pgp} = require('./db');
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
module.exports = function insertDummyProfiles(){
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
    ], {table: {schema : 'public', table : 'Profile'}});

    const insert = pgp.helpers.insert(data, cs);

    db.none(insert)
        .then(() => {
            console.log("Working")
        })
        .catch(error => {
            console.log(error);
        });
}