const express=require('express');
const app=express();
const bcrypt=require('bcrypt');
const session=require('express-session');
const mysql=require('mysql2');
const path = require('path');
const cors=require('cors')
const filestore = require("session-file-store")(session)
require('dotenv').config();
const bodyParser = require("body-parser");
const puppeteer = require('puppeteer');
const fs = require('fs');
const ejs= require('ejs');


app.use(express.static(path.join(__dirname,'/../client/build')));

app.use((req,res,next)=>{
    console.log(path.join(__dirname,'/../client/build'));
    next();
});

// app.use(cors({
//     origin: ["http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true,
// }));
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret:'asecret',
    saveUninitialized: true,
    resave: false,
    store: new filestore(),
    cookie : {
        secure:'auto',
        sameSite: 'strict', // THIS is the config you are looing for.
    }
}));

app.use(bodyParser.json())


app.use((req,res,next)=>{
    console.log(req.body,"session-> ",req.session);
    next();
})

const db = mysql.createConnection({
    // host:"database-1.cz4k2aulzdrl.ap-south-1.rds.amazonaws.com",
    // host:process.env.HOST,
    host:"localhost",
    // user:process.env.MYSQL_USER,
    // user:"admin",
    user:"root",
    // password:process.env.PASSWORD,
    password:"rootpass",
    database:"toptrove"
    // database:process.env.DATABASE
})//fill it up

db.connect(function(err) {
if (err) {
    return console.error('error: ' + err.message);
}
console.log('Connected to the MySQL server.');
})


//home page routes
app.get("/*",(req,res)=>
{

  res.sendFile(path.join(__dirname, '/../client/build', 'index.html'));

});


app.post('/register',async(req,res)=>{

    const {username,password,fname,lname}=req.body;
    const hash=await bcrypt.hash(password,12);

    const query2="SELECT id from auth where user_name=?"//change the table name,column name as per requirement

    db.query(query2,username,(err,result)=>{
        if(err)
        {
            console.log(err);
            res.sendStatus(403);
        }
        if(result.length!=0)
        {
            console.log('Username already exists');
            res.sendStatus(400)
        }
        else{
            const values=[username,hash,fname,lname];

            const query="INSERT INTO auth(`user_name`,`user_password`,`first_name`,`last_name`) values (?,?,?,?)"//change the table name,column name as per requirement
            db.query(query,values,(err,result)=>{
                if(err)
                {
                    console.log(err);
                    res.redirect('/register')
                }
                // console.log("result ",result);
                console.log('Account created for ',username);
                res.sendStatus(200);
            })
        }
    })
})


app.post('/login',async(req,res)=>{
    const {username,password}=req.body||"nulluser";
    // console.log('username-> ',username);

    if(username=='' || password=='')
    {
        res.statusCode = 400;
        res.send("Invalid Details");
    }
    const query2="SELECT id,user_password from auth where user_name=?"//change the table name,column name as per requirement

    db.query(query2,username,async (err,result)=>{
        if(err)
        {
            console.log(err);
            res.statusCode = 400;
            res.send("Invalid Details");
        }

        if(result.length==0)
        {
            console.log('first WRONG USERNAME OR PASSWORD');
            res.statusCode = 401;
            res.send("Unauthorized");
        }
        else{
            var userId=result[0].id || 0;
            var passwordhash=result[0].user_password || "";
                const validuser=await bcrypt.compare(password,passwordhash);
                if(validuser)
                {
                    req.session.user_id=userId;
                    req.session.username=username;

                    console.log("valid",req.session);
                    // res.statusCode=200;
                    // res.send({success:true,userId});
                    res.send(req.session);
                }
                else{
                    res.statusCode=400;
                    res.send({success:false});
                }
            }
        }
    )
});

app.post('/logout',(req,res)=>{
    // req.session.user_id=null;
    req.session.destroy();
    console.log('LOGGED OUT SUCCESSFULLY');
    res.sendStatus(200);
})

app.post('/filestore',async (req,res)=>{
    const{cname,ctitle,cscore,cdate,uname}=req.body;//name of candidate,job title,score of candidate and date of issue of certificate is taken from request body.
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
      var compiled = ejs.compile(fs.readFileSync(__dirname + '/views/cert1.ejs', 'utf8'));
      var html = compiled({ name: cname, title:ctitle , score:cscore,date:cdate});//DYNAMIC VALUES
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
    } catch (error) {
      console.log(new Error(`${error}`));
      await browser.close();
      res.send(error);
      return;
    }

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      // path: `${cname}.pdf`,
      margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
      printBackground: true,
      format: 'letter',
    });
    //once the pdf is created it is not stored in any path, instead its stored in database in next step.
    await browser.close();
    const values=[cname,pdf,uname];
    const query= "INSERT INTO certificate(`file_name`,`file_data`,`username`) values (?,?,?)";
    db.query(query,values,(err,result)=>{
      if(err)
      {
        console.log(err);
        res.send(err)
        return;
      }
      console.log(result);
    });
    res.send('ok');
});


//  app.post("/fileget", (req, res) => {
//     // const  file_name =req.body.file_name|| "nulluser";
//     const  file_user =req.body.file_name|| "nulluser";
//     console.log(file_user);
  
//     const query = "Select file_data From certificate Where username = ?";
//     db.query(query, [file_user],(err, result) => {
//       if (err) {
//         console.log(err);
//       }
//       try {
//         fs.writeFileSync(path.join(__dirname, `/../client/build/${file_user}.pdf`), Buffer.from(result[0].file_data));
//       } catch (error) {
//         console.log(error);
//         // res.send('error in accessing file from daatabse');
//       }
//     res.send('ok');

//     })
//   });

app.post("/fileget", (req, res) => {
    const  file_user =req.body.file_name|| "nulluser";
    console.log('in file get',file_user);

    const query = "Select file_data From certificate Where username = ?";
    db.query(query, [file_user],(err, result) => {
      if (err) {
        res.status(500).send("Error retrieving file data");
      }
      else if(result.length==0)
      {
        res.status(400).send('File not found');
      }
      else{
        const fileData = result[0].file_data;
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(fileData, "binary"));
      }
    })
});


  app.post('/clearfile',(req,res)=>{

    const file_user =req.body.file_name || "nullfile";
    console.log('clear file ',file_user);
    // fs.unlink(path.join(__dirname, `../client/build/${file_user}.pdf`), (err)=>{
    //   if(err) console.log(err);;
    // })
    res.send('File deleted');
  
  });


const port=process.env.PORT || 8880;

app.listen(port,()=>{
    console.log(`SESSION HEARING on ${port}..`);
})