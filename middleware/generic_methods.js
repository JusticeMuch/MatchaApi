const {pgp, db} = require('../db');
const request = require('request');
require('dotenv').config();
var FormData = require('form-data');

// async updateById(id, values)

function EndpointResponse(success, data = null, reasonForFailure = null) {
    if (success) {
        return {success: true, data: data}
    } else {
        return {success: false, Error: reasonForFailure}
    }
}

const getBy = async (type, value, table) => {
    try {
        return await db.any(`SELECT * FROM public."${table}" WHERE $1:name = $2`, [
            type, value
        ],);
    } catch (err) {
        console.log(`Error in getBy on table ${table}`);
        return null;
    }
}

const getFiltered = async (table, type, value, inputs) => {
    try {
        return await db.any(`SELECT ${inputs} FROM public."${table}" WHERE $1:name = $2`, [type, value]);
    } catch (err) {
        console.log(`Error in getFiltered on table ${table} + ${{message : err.message}}`);
        return null;
    }
}

const updateById = async (table, id, values) => {
    if (Object.keys(values).length == 0) 
        return {success: false, Error: "values are empty"}
    
    try {
        const query = `${
            pgp.helpers.update(values, values, `${table}`,)
        } WHERE id = $/id/ returning id`;
        return await db.any(query, {id}).then(async (data) => {
            return data;
        });
    } catch (err) {
        console.log(`Error in updateById on table ${table} + ${{message : err.message}}`);
        return null;
    }
}

const checkField = async (obj, Fields) => { // returns keys and objects of Profile Field
    let result = {}
    const keys = Object.keys(obj);
    await keys.forEach((data) => {
        if ((obj[data]) && Fields.includes(data)) {
            result[data] = obj[data];
        }
    });
    return result;
}

const deleteByValue = async(table, field, value) =>{
    if (table && field && value){
        try {
            return await db.any(`DELETE FROM public."${table}" WHERE $1:name = $2 RETURNING *`, [field, value]);
        } catch (err) {
            console.log(`Error in deleteByValue on table ${table} + ${{message : err.message}}`);
            return Error(err.message)
        } 
    }else{
        return Error("Fields are blank in function deleteByValue");
    }
}

module.exports = {
    EndpointResponse,
    getBy,
    getFiltered,
    updateById,
    checkField,
    deleteByValue
}
