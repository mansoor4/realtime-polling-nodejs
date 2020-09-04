const express = require("express");
const router = express.Router();
const con=require('../controller/poll')
const {check}=require("express-validator");
const Vote = require("../models/Vote");

// router.get("/",con.home);

// router.get("/link",con.link_get);

// router.post("/link",con.link_post);


router.get('/',con.formget);

router.post('/',
[
  check("title")
  .trim()
  .custom(async(value,{req})=>
    {
      if(value==="" || !value )
      {
        throw new Error("Fill the Title field");
      }
      const vote= await Vote.findOne({title:value})
      if(vote)
      {
         throw new Error( `<strong style="text-transform: capitalize; color:red;">${value}</strong> is alredy in used`);
      }
      return true;
    }),
  check("question")
  .trim()
  .custom((value,{req})=>
  {
    if(value==="" || !value )
    {
      throw new Error("Fill the Question field");
    }
    return true;
  }),
  check("option")
  .custom((value,{req})=>
  {
    let i=0;
    for(let opt in value)
    {
      value[opt]=value[opt].trim();
      i++;
    }
    for(let opt in value)
    {
      if(value[opt]==="" || !value[opt])
      {
        throw new Error("Fill all the Options field");
      }
    }
    if(i<=1)
    {
      throw new Error("Options must be more than 2");
    }
    return true;
  })  
],
con.formpost)

// change in title or id
router.route('/poll/:id')
  .get(con.pollget)
  .post(con.pollpost)


module.exports = router;
