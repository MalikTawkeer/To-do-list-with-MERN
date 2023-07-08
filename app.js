const express = require("express");
const body_parser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
//sets which techinolody is used to create html
app.set("view engine", "ejs");
//enabled to get data from user form data
app.use(body_parser.urlencoded({ extended: true }));
//enables css
app.use(express.static("public"));

//establishing connection with mongodb
mongoose.connect("mongodb+srv://admin-malik:kilamkilam@cluster0.m0w3k02.mongodb.net/ToDoListNew");

//creating item scheama
const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});
//creating model
const Item = mongoose.model("Item", ItemSchema);

//custom list schema
const CustomListSchema = new mongoose.Schema({
  name: String,
  items: [ItemSchema],
});
//custom list model
const customList = mongoose.model("customList", CustomListSchema);

const burger = new Item({ name: "burger" });
const mango = new Item({ name: "mango" });
const grapes = new Item({ name: "grapes" });
const defaultItems = [burger, mango, grapes];

//home route
app.get("/", (req, res) => {
  Item.find((err, foundList) => {
    if (foundList.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log("error while insert default items");
          console.log(err);
        } else {
          console.log("default items inserted- SUCCESS");
          res.render("home");
        }
      });
    } else {
      res.render("home", { title: "home", items: foundList });
    }
  });
});
app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  const list_name = req.body.submitBtn.trim();

  const new_item = new Item({
    name:newItem
  })
  if(list_name === "home"){
    new_item.save((err)=>{
      if(!err){
        console.log("new item stored into items");
        res.redirect('/')
      }
    })

  }else{
    customList.findOne({name: list_name}, (err, listFound)=>{
      if(!err){
        listFound.items.push(new_item)
        listFound.save()
        res.redirect("/"+list_name)
      }
    })
  }
});

//custom list functionality
app.get("/:customListName", (req, res) => {
  const custom_list_name = req.params.customListName;

  customList.findOne({ name: custom_list_name }, (err, listFound) => {
    if (err) {
      console.log(err);
    } else {
      if (!listFound) {
        const custom_item = new customList({
          name: custom_list_name,
          items: defaultItems,
        });
        custom_item.save((err) => {
          if (!err) {
            console.log("inital custom list inserted-SUCCESS");
            res.render("home", {
              title: custom_item.name,
              items: custom_item.items,
            });
          }
        });
      } else {
        res.render("home", { title: listFound.name, items: listFound.items });
      }
    } //end of outer else
  });
});

//deleting the item from mongo DB
app.post("/delete", (req, res) => {
  const del_Item_Id = req.body.checkbox; // returns the id when checkbox is clicked
  const list_name = req.body.listname.trim();

  if (!mongoose.Types.ObjectId.isValid(del_Item_Id)) {
    del_Item_Id = del_Item_Id.replace(/\s/g, "");
  }

  if (list_name == "home") {
    Item.findOneAndRemove(del_Item_Id, (err) => {
      if (err) {
        console.log(err + "Error while deleting item from home.");
      } else {
        console.log("item deleted from items collection");
        res.redirect("/");
      }
    });
  }//end of outer if
   else {
    customList.findOneAndUpdate(
      { name: list_name },
      { $pull: { items: { _id: del_Item_Id } } },
      (err, foundList) => {
        if (!err) {
          
          console.log("item deleted from customList Collection");
          res.redirect("/" + list_name);
        }
      }
    );
  }//end of else
});

app.listen(3000, () => {
  console.log("server is running on Port 3000");
});
