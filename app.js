const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
//const _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();

//Setting up MongoDB COnnections and it's values through process envirnment variables. 
const srvURL = process.env.N1_URL || "127.0.0.1:27017";
const dbUser = process.env.N1_KEY || "wikiAdmin";
const dbPasswd = process.env.N1_SECRET || "wikiAdmin123";
const dbName = process.env.N1_DB || "wikiDB";

mongoose.set("strictQuery", false);

const app = express();

const port = 2934;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const mongoDB = "mongodb://"+dbUser+":"+dbPasswd+"@"+srvURL+"/"+dbName;
const mongoDB = 'mongodb+srv://'+dbUser+':'+dbPasswd+'@'+srvURL+'/'+dbName+'?retryWrites=true&w=majority';

main().catch(err => console.log(err));
async function main() {
    //await mongoose.connect('mongodb://127.0.0.1:27017/test');
    try {
      await mongoose.connect(mongoDB);  //if your database has auth enabled  
    } catch (error) {
      console.log(error);
    }    
}

const articlesSchema = new mongoose.Schema ({
  title: {
    type: String,
    maxLength: 50,
    required: [true, 'Why no name?']
  },
  content: {
    type: String,
  },
});

const Article = mongoose.model("Article",articlesSchema);

// Using the Route chaining for a single route with targetting only articles path here for Get All, Post and Delete All methods

app.route("/articles")

//Get Route to fetch all articles
  .get(async (req, res) => {
    try {
      const foundArticles = await Article.find({ });
      res.send(foundArticles);
      console.log(foundArticles)
    } catch (err) {
      console.log(err);
    }
  })

// Post route to fetch a/many articles

  .post(async (req, res) => {

    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });

    try {
      let saveArticle = await newArticle.save();
      console.log("Successfully saved an Article.")
      res.send("Successfully saved.")
    } catch (error) {
      console.log(error);
      res.send(error);
    }

  })

// Delete route to delete all the articles
  .delete(async (req, res)=>{
    try {
      let deleteArticles = await Article.deleteMany({ });
      res.send("Successfully deleted All Articles.")
    } catch (err) {
      res.send(err);
    }
  });

// Using the Route chaining for a specific articles with path params route with targetting only specific article path here for Get One, Post One and Delete One and Update one methods

app.route("/articles/:articleName")

//Get Route to fetch all articles
  .get(async (req, res) => {
    try {
      //let articleName = _.capitalize(req.params.articleName);
      let articleName = req.params.articleName;
      const foundArticle = await Article.findOne({title: articleName });
      if (foundArticle){
        res.send(foundArticle);
      }
      else{
        res.send("No Matched Article Found.");
      }
      
      //console.log(foundArticle)
    } catch (err) {
      console.log(err);
    }
  })

  .put(async (req, res) =>{
    try {
      //let articleName = _.capitalize(req.params.articleName);
      let articleName = req.params.articleName;
      const result = await Article.replaceOne({ title: articleName }, {title: req.body.title, content: req.body.content});
      if (result.modifiedCount === 1){
        res.send("The article "+articleName+" updated for Content successfully.");
      }
      else{
        res.send("No Matched Article Found for Update.");
      }
      console.log(result.modifiedCount)
    } catch (err) {
      console.log(err);
    }
  })

  .patch(async (req, res) => {
    try {
      let articleName = req.params.articleName;
      const result = await Article.updateMany(
        {title: articleName},
        {$set: req.body}
      );
      if (result.modifiedCount === 1){
        res.send("The article "+articleName+" updated for Content successfully.");
      }
      else{
        res.send("No Matched Article Found for Update.");
      }
      console.log(result.modifiedCount);
    } catch (error) {
      console.log(error);
    }
  })

  .delete(async(req, res)=>{
    try {
      let articleName = req.params.articleName;
      const result = await Article.deleteOne({title: articleName});
      if (result.deletedCount > 0){
        res.send("The article "+articleName+" deleted successfully.");
      }
      else{
        res.send("No Matched Article Found for Deletion.");
      }
      console.log(result.deletedCount);
    } catch (error) {
      console.log(error);
    }
  });

app.listen(port, function() {
    console.log("Hasmukh's Wiki App Server started on port "+port);
  });
