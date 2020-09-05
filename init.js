const fs = require('fs');
const {db, pgp} = require('./db');
const bcrypt = require('bcrypt');

require('dotenv').config();
let data = JSON.parse(fs.readFileSync('users.json'));
// let intersts = JSON.parse(fs.readFileSync('interests.json'));
// let interests = intersts['hobbies'];;

// function generateInterests(){
//     let data = [];
//     for (let j = 0; j < 20 ; j++){
//         let p =Math.floor(Math.random() * (interests.length - 1));
//         let i = interests[p];
//         if (!data.includes(i))
//             data.push(i)
//     }
//     return data;
// }



//     data.forEach(async (element) => {
//         let size = Math.floor(Math.random() * 150) + 480
//         element.profile_picture = `https://picsum.photos/${size}/${size}`;
//         element.images = [`https://picsum.photos/481/${size}`, `https://picsum.photos/482/${size}`,`https://picsum.photos/483/${size}`]
//         element.interests = generateInterests();
//         element.authenticated = true;
//         element.suspended = false;
//     });

//     console.log(data[1])


// fs.writeFileSync('users.json', JSON.stringify(data));
module.exports = async function insertDummyProfiles() {
    // const salt = await bcrypt.genSalt(10);
    // const hash = await bcrypt.hash(process.env.PG_PASSWORD, salt);

    await db.any('DELETE FROM public."Profile" WHERE id >= 1009');

    // await db.any('INSERT INTO public."Admin" (id, username, password) VALUES ($1, $2, $3) RETURNING id', [
    //     process.env.ADMIN_ID, process.env.PG_USERNAME, hash
    // ],).then().catch(err => console.log(err));

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
        'authenticated',
        'suspended',
        'images'
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
