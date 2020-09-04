const mongoose = require("mongoose");
const express = require("express");
const app = express();
const {validationResult}=require("express-validator");
require('events').EventEmitter.prototype._maxListeners = 70;
require('events').defaultMaxListeners = 70;

const Vote = require("../models/Vote");


const keys = require("../config/keys");

module.exports={
    // home:(req,res,next)=>
    // {
    //    res.render("home",
    //    {
    //        pageTitle:"Coding block poll",
    //        errors:[],
    //        success_msg:[]
    //    })
    // },

    // link_get:(req,res,next)=>
    // {
    //    res.render("link",
    //    {
    //        pageTitle:"link"
    //    })
    // },

    // link_post:(req,res,next)=>
    // {
    //     res.redirect("/poll/"+req.body.id);
    // },


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
                    res.redirect(`/poll/${data._id}`)
                    //  res.render('poll',{
                    //     pageTitle:"POLL",
                    //     title:data.title,
                    //     question:data.question,
                    //     choice:data.choice,
                    //     errors:[],
                    //     success_msg:["Your Poll is successfully created"],
                    //     _id:data._id
                    // })
                }
                
            })
            .catch(err=>{
                res.status(500).render("error",
                {
                    pageTitle:"ERROR"
                })
            })
        }
       
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
                   req.io.to(data._id.toString()).emit('chart',{
                    choice:data.choice
                });
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
                          return  res.json({msg:'success'});               
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
}
