const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemSchema = {
  name: String
};

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!'
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.'
});

const item3 = new Item({
  name: '<-- Hit this to delete an item.'
});

const defaultArray = [item1, item2, item3];

const listSchema = {
  name: String,
  list: [itemSchema]
};

const List = mongoose.model('List', listSchema);

app.get("/", (req, res) => {

  const day = date.getDate();

  findItems();
  async function findItems() {
    try {
      const foundItems = await Item.find();

      if (foundItems.length === 0) {
        Item.insertMany(defaultArray);
        res.redirect('/');
      }
      else {
        res.render("list", {listTitle: day, newListItems: foundItems});
      }
    }
    catch (e) {
      console.log(e.message);
    }
  }

});

app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });

  run();
  async function run () {
    if (listName === date.getDate()) {
      item.save();
      res.redirect('/');
    } else {
      const foundList = await List.findOne({ name: listName });
      foundList.list.push(item);
      foundList.save();
      res.redirect('/' + listName);
    }
  }

});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;

  removeCheckedItem();
  async function removeCheckedItem() {
    await Item.findByIdAndRemove(checkedItemId);
  }

  res.redirect('/');
});

app.get('/:customListName', (req, res) => {
  const customListName = req.params.customListName;
  console.log(customListName);
  checkListExist ();
  async function checkListExist () {
    const foundList = await List.findOne({ name: customListName });

    if (!foundList) {
      //create new list
      const list = new List ({
        name: customListName,
        list: defaultArray
      });
      list.save();

      res.redirect('/' + customListName);
    }
    else {
      //show existing list
      res.render('list', {listTitle: foundList.name, newListItems: foundList.list});
    }
  }

});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
