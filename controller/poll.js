const mongoose = require("mongoose");
const express = require("express");
const app = express();
const {validationResult}=require("express-validator");
// const http = require("http").createServer(app);
// let io = require("socket.io")(http);

const Vote = require("../models/Vote");


const keys = require("../config/keys");

module.exports={
    home:(req,res,next)=>
    {
       res.render("home",
       {
           pageTitle:"Coding block poll",
           errors:[],
           success_msg:[]
       })
    },

    link_get:(req,res,next)=>
    {
       res.render("link",
       {
           pageTitle:"link"
       })
    },

    link_post:(req,res,next)=>
    {
        res.redirect("/poll/"+req.body.id);
    },


    formget:(req,res)=>{
        res.render('index',
        {
            pageTitle:"Crete Poll",
            errors:[],
            field:
            {
                title:"",
                question:""
            },
            validation:[],
            success_msg:[]
        });
    },
    formpost:(req,res)=>{ 
        // validation of title by creating index and using if(err.code==1100)
        const errors=validationResult(req);
        if(!errors.isEmpty())
        {
             res.render("index",
            {
                pageTitle:"Create Poll",
                errors:errors.array(),
                field:
                {
                    title:req.body.title,
                    question:req.body.question
                },
                validation:errors.array().map(error=>error.param),
                success_msg:[]
            })
        }
        else
        {
        const{title,question,option}=req.body
        var choice=[];
        for(let opt in option)
        {
            choice.push({opt:option[opt]});
        }
        const newVote=new Vote({title,question,choice})
            newVote.save()
            .then((data)=>{
                if(data)
                {
                     res.render('poll',{
                        pageTitle:"POLL",
                        title:data.title,
                        question:data.question,
                        choice:data.choice,
                        errors:[],
                        success_msg:["Your Poll is successfully created"],
                        _id:data._id
                    })
                }
                
            })
            .catch(err=>{
                res.status(500).render("error",
                {
                    pageTitle:"ERROR"
                })
            })
        }
        // Vote.find().then((votes) => res.json({ success: true, votes: votes }));
     },
    pollget:(req,res)=>{
             // socket 
             req.io.on('connection',(socket)=>{
                console.log('new user connected');
                socket.on('join',(param)=>{
                    socket.join(param.room.toString())
                })
            })
        Vote.findById(req.params.id)
            .then(data=>{
                if(data)
                {
                    res.render('poll',
                    {
                       pageTitle:data.title,
                       title:data.title,
                       question:data.question,
                       choice:data.choice,
                       errors:[],
                       success_msg:[],
                       _id:data._id
                   })
                }
            })
           .catch(err=>
           {
            req.flash('flash_error','No such poll existes');
            res.redirect('/poll');
           }) 
    },


    pollpost:(req,res)=>{
        const{option,_id}=req.body;
        if(req.session.vote===undefined)
        {
        Vote.updateOne({'_id':_id,'choice.opt':option},
        {
            
                $inc:{'choice.$.vote':1}
            
        })
        .then(choice=>
            {
                Vote.findById(_id)
                .then(vote=>
                    {
                        req.session.vote=true;
                        req.io.to(_id.toString()).emit('voteCount',{

                            choice:vote.choice
                        })
                            res.json({msg:'success'});               
                    })
                 .catch(err=>
                    {
                        res.status(500).render("error",
                        {
                            pageTitle:"ERROR"
                        })
                    })   
            })
            .catch((err)=>{
                res.status(500).render("error",
                {
                    pageTitle:"ERROR"
                })
            });
        }
        else
        {
            req.flash("flash-error","you can vote only one time");
           res.redirect(`/poll/${_id}`);
        }
}
}
