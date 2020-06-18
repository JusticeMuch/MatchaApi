const {pgp, db} = require('../db');
// async updateById(id, values)

function EndpointResponse(success , data = null, reasonForFailure = null){
    if (success){
        return {success : true, data : data}
    }else{
        return {success : false, Error : reasonForFailure}
    }
}

const getBy = async (type, value, table) => {
    try {
      return await db.any(
        `SELECT * FROM public."${table}" WHERE $1:name = $2`,
        [type, value],
      );
    } catch (err) {
        console.log(`Error in getBy on table ${table}`);
        return null;
    }
  }

const getFiltered = async (table, type, value, inputs) => {
    try{  
        return await db.any(
        `SELECT ${inputs} FROM public."${table}" WHERE $1:name = $2`,
        [type, value]
      );
    } catch (err) {
        console.log(`Error in getFiltered on table ${table} + ${err}`);
        return null;
    }
  }

const updateById = async(table, id, values) =>{
  if (Object.keys(values).length == 0)
    return {success : false, Error : "values are empty"}
    try {
      const query = `${pgp.helpers.update(
        values,
        values,
        `${table}`,
      )} WHERE id = $/id/`;
     return  await db.any(query, { id }).then(async (data) => {
        return await {success : true, data : data}
      });
    } catch (err) {
        console.log(`Error in updateById on table ${table} + ${err}`);
        return {success : false, error : err}
    }
  }

const checkField = async (obj, Fields) => { // returns keys and objects of Profile Field
  let result = {}
  for (var key in obj){
    if (!(obj[key]) && Fields.includes(key))
      result[key] = obj[key];
  }
  return result;
}

module.exports = {EndpointResponse, getBy, getFiltered, updateById, checkField}