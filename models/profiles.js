const {db, pgp} = require('../db');

class Profile{

    async createProfile(object){
        const {firstname, lastname, username, password, email} = object;
        return await db
        .any(
          'INSERT INTO public."Profile" (firstname, lastname, username, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [firstname, lastname, username, password, email],
        )
        .then(data => {
          return { created: true, id: data[0].id };
        });
    } catch (err) {
      if (process.env.VERBOSE === 'true')
        console.log(err, 'in model User.create()');
      return { created: false, error: err };
    }

    async checkPassord

    
}
let createProfile = new Profile().createProfile;
createProfile({firstname : "justin", lastname : "ronald", username : "jronald", password :"working", email :"test@test.com"});