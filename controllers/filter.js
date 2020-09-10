const {db, pgp} = require('../db');
const Joi = require('@hapi/joi');
const {Block} = require('../models/block');
const block = new Block();
const {getBy, getFiltered, updateById, checkField} = require('../middleware/generic_methods');

const schema = Joi.object({
    sexual_preference: Joi.string(),
    age: Joi.object(
        {min: Joi.number().required(), max: Joi.number().required()}
    ),
    popularity: Joi.object(
        {min: Joi.number().required(), max: Joi.number().required()}
    ),
    interests: Joi.array(),
    radius: Joi.number(),
    id : Joi.number()
})

// const filter = {
//     sexual_preference : both,
//     age : {min : null, max : null},
//     interests : [],
//     popularity : {min : null, max : null},
//     radius : null
// }

const filterInterests = (interests, data) => {
    return data.filter(elem => interests.every(el => elem.interests.includes(el)));
}

const filterLocation = (radius, data, userLoc) => {
    let result = [];
    data.forEach(elem => {
        if (Math.sqrt(Math.pow(elem.location[0] - userLoc[0], 2) + Math.pow(elem.location[1] - userLoc[1], 2)) <= (radius / 110.4)) 
            result.push(elem);
        


    })
    return result;
}

const filterBlocked = async (userId, data) => {
    try {
        let res = [];
        blockedData = await block.getBlock(userId);
        if (blockedData && blockedData != undefined) {
            data.forEach(element => {
                delete element.password;
                if (!(blockedData.filter(e => e.blocked_user == element.id).length > 0))
                    res.push(element);
            });
            return res;
        }else{
            return data;
        }
        
    } catch (error) {
        console.log(error);
        return Error(error);
    }

}

const addSexPref = (preference) => {
    if (preference == 'both' || !preference || preference === undefined) 
        return(" WHERE (gender = 'male' OR gender = 'female')")
     else 
        return(` WHERE gender = '${preference}'`);
    


}

const addAgePreference = (obj) => {
    let dateMin = new Date();
    let dateMax = new Date();
    dateMax.setFullYear(dateMax.getFullYear() - obj.max);
    dateMin.setFullYear(dateMin.getFullYear() - obj.min);
    return(` AND birthdate BETWEEN '${
        dateMax.toISOString().replace('T', ' ').substr(0, 10)
    }' AND '${
        dateMin.toISOString().replace('T', ' ').substr(0, 10)
    }'`);
}

const addPopularityPreference = (obj) => {
    return(` AND popularity BETWEEN ${
        obj.min
    } AND ${
        obj.max
    }`);
}

const addIdFilter = (id) => {
    return (` AND id = ${id}`);
}

const buildFilterStr = (obj, user) => {
    console.log(obj);
    const {sexual_preference, age, popularity, id} = obj;
    let sqlStr = `SELECT * FROM public."Profile" `;
    sqlStr += addSexPref(sexual_preference);
    if (age && age != undefined) 
        sqlStr += addAgePreference(age);

    if (popularity && popularity != undefined) 
        sqlStr += addPopularityPreference(popularity);

    if (id && id != undefined)
        sqlStr += addIdFilter(id);
    sqlStr += ` AND (sexual_preference = '${
        user.gender
    }' OR sexual_preference = 'both')`
    return sqlStr;
}

module.exports = filterProfiles = async (req, res) => {
    console.log(req.body);
    const {error} = await schema.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    


    userData = (await getBy('id', req.user._id, "Profile"))[0];
    const {radius, interests} = req.body;

    if (!userData || userData === undefined) 
        return res.status(400).send({success: false, Error: {message :"Error in getting user data"}});

    console.log(await buildFilterStr(req.body, userData));
    profiles = await db.any(await buildFilterStr(req.body, userData)).then((data) => {
        if (!data || data === undefined) 
            return res.status(400).send({success: false, Error: {message : "Error in getting profiles"}});
        


        return data;
    });

    

    if (radius && radius != undefined) 
        profiles = filterLocation(radius, profiles, userData.location);
    


    if (interests && interests != undefined) 
        profiles = await filterInterests(interests, profiles);
    

    
    profiles = await filterBlocked(req.user._id, profiles);

    res.status(200).send({success: true, data: profiles, message: " Profiles filtered successfully"});
}
