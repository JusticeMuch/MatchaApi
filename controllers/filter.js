const {db, pgp} = require('../db');
const Joi = require('@hapi/joi');
const Block = require('../models/block');
const block = new Block();
const {getBy, getFiltered, updateById, checkField} = require('../middleware/generic_methods');

const schema = Joi.object({
    sexual_preference : Joi.string(),
    age : Joi.object({
        min : Joi.number().required(),
        max : Joi.number().required()
    }),
    popularity : Joi.object({
        min : Joi.number().required(),
        max : Joi.number().required()
    }),
    interests : Joi.array(),
    radius : Joi.number()
})

const filter = {
    sexual_preference : both, //male , female, both
    age : {min : null, max : null},
    interests : [],
    popularity : {min : null, max : null},
    radius : null
}

const filterInterests = (interests, data) => {
    return data.filter(elem => interests.every(el => elem.interests.includes(el)));
}

const filterLocation = (radius, data, userLoc) => {
    let result = [];
    data.forEach(elem => {
        if (Math.sqrt(Math.pow(elem.location[0] - userLoc[0], 2) + Math.pow(elem.location[1] - userLoc[1], 2)) <= radius)
            result.push(elem);
    })
    return result;
}

const filterBlocked = async (userId, data) => {
    try {
        blockedData = await block.getBlock(userId);
        let blockedUsers = await blockedData.map({blocked_user} = blocked_user);
        return await data.filter((e) => blocked_user.includes(e.id));
    } catch (error) {
        console.log(error);
        return Error (error);
    }
    
}

const addSexPref = (preference) => {
    if (preference == 'both' || !preference || preference === undefined)
        return ('WHERE gender = "male" AND gender = "female" ')
    else
        return (`WHERE gender = "${preference}" `);
}

const addAgePreference = (obj) => {
    let dateMin = new Date();
    let dateMax = new Date();
    dateMax.setFullYear(dateMax.getFullYear() - obj.max);
    dateMin.setFullYear(dateMin.getFullYear() - obj.min);
    return (`AND WHERE age BETWEEN ${dateMin} AND ${dateMax}`);
}

const addPopularityPreference = (obj) => {
    return (`AND WHERE popularity BETWEEN ${obj.min} AND ${obj.max} `);
}

const buildFilterStr = (obj) => {
    const {sexual_preference, age, popularity} = obj;
    let sqlStr = `SELECT * FROM public."Profile" `;
    sqlStr += addSexPref(sexual_preference);
    if (age  && age != undefined)
        sqlStr += addAgePreference(age);
    if (popularity && popularity != undefined)
        sqlStr += addPopularityPreference(popularity);
    return sqlStr; 
}

const filterProfiles = async (req, res) => {
    const{error} = await schema.validate(req.body);
    if (error) return res.status(400).send({success : false , Error : error.details});

    userData = (await getBy('id', req.user._id, "Profile"))[0];
    const {radius, interests} = req.body;

    if (!userData || userData === undefined)
        return res.status(400).send({success : false, Error : "Error in getting user data"});

    profiles = await db.any(buildFilterStr(req.body) + `AND WHERE sexual_preference = ${userData.gender}`).then((data) => {
        if (!data || data === undefined)
            return res.status(400).send({success : false, Error : "Error in getting profiles"});
        return data;
    });

    if (radius && radius != undefined)
        profiles = await filterLocation(radius, profiles, userData.location);

    if (interests && interests != undefined)
        profiles = await filterInterests(interests, profiles);
    
    profiles = await filterBlocked(req.user._id, profiles);

    res.send(200).send({success : true, data : profiles , message : " Profiles filtered successfully"});
}