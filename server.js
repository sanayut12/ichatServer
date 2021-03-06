const express = require('express');
var firebase = require("firebase-admin");
const random = require('random');
var port = process.env.PORT || 3000
//config express
const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods','POST, GET, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers','Content-Type, Option, Authorization');
    return next();
 });

app.use(express.static('public'));
app.use(express.json());
//config firebase 
var serviceAccount = require("./serviceFirebase.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://ichatdatabase-default-rtdb.firebaseio.com",
  storageBucket: "gs://ichatdatabase.appspot.com/"
});
var database = firebase.database();
var storage = firebase.storage().bucket();
//..........http register..................
app.get('/',function(req,res){
    res.send('Hello welcome from i chat server')
})
app.post('/register',async function(req,res){
    var body = {
        username : req.body.username,
        password : req.body.password,
        email : req.body.email,
        image : "none",
        url : "https://firebasestorage.googleapis.com/v0/b/ichatdatabase.appspot.com/o/background.jpg?alt=media&token=bebfcba0-3988-459f-8b94-5eadfb95bc5a"
    };

    var status = await firebaseCheckUser(body);   //return trye or false   use check user duoble
    
    if(status)
    {   
        firebaseRegister(randomID(),body); //if no user bouble will be set data to database
        res.send({status : true});
    }
    else{
        res.send({status : false});
    }

}); 

app.post('/login',async function(req,res){
    var body = {
        username : req.body.username,
        password : req.body.password
    };
    var status = await firebaseLogin(body);
    res.send(status);
});

//method use  user search for add friend
app.post('/forsearch',async function(req,res){
    var body = {
        ID_user : req.body.ID_user
    };
    console.log(body);
    res.send(await firebaseSearch(body.ID_user));
});
app.post('/addfriend',async function(req,res){
    var body = {
        ID_user1 : req.body.ID1,
        ID_user2 : req.body.ID2,
        status : "wait"
    };
    console.log('======================add friend===================');
    console.log(body);
    firebaseAddfriend(randomID(),body);

    res.send({status : true});
});

app.post('/confirmfriend',async function(req,res){
    var body = {
        ID_friend : req.body.ID_friend,
        status : req.body.status
    };
    console.log('======================confirm friend===================');
    console.log(body);
    await confirmFreind(body.ID_friend,body.status);
    res.send(true);
});


app.post('/unwait',async function(req,res){
    var body = {
        ID_friend : req.body.ID_friend,
        status : req.body.status
    };
    console.log('======================unwait and unfriend===================');
    console.log(body);
    deleteFriend(body.ID_friend);
    res.send(true);
});

app.post('/friendMe',async function(req,res){
    var body = {
        ID : req.body.ID
    };
    console.log(body);
    var list_friend = await friendMe(body.ID);
    var friend =await friendMeInfo(list_friend);
    res.send(friend);
    ///
});
// friendOperator(ID_friend,status)
app.listen(port,()=>{
console.log("http://localhost:"+port);
});


///____________________________________________________function_________________________________________________________
function randomID(){
    var r0= random.int((min=0),(max=9));
    var r1= random.int((min=0),(max=9));
    var r2= random.int((min=0),(max=9));
    var r3= random.int((min=0),(max=9));
    var r4= random.int((min=0),(max=9));
    var r5= random.int((min=0),(max=9));
    var r6= random.int((min=0),(max=9));
    var r7= random.int((min=0),(max=9));
    var r8= random.int((min=0),(max=9));
    var r9= random.int((min=0),(max=9));
    

    return String(r0)+String(r1)+String(r2)+String(r3)+String(r4)+String(r5)+String(r6)+String(r7)+String(r8)+String(r9);
}
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

function firebaseRegister(ID,body) {
    database.ref('users/' + ID).set({
        username: body.username,
        password:body.password,
        email: body.email,
        message_box:"",
        image : "none",
        url_image : "https://firebasestorage.googleapis.com/v0/b/ichatdatabase.appspot.com/o/person.png?alt=media&token=dde8bc88-68fa-409e-a344-08bc98bb3c89",
        background : "none",
        url_background : "https://firebasestorage.googleapis.com/v0/b/ichatdatabase.appspot.com/o/background.jpg?alt=media&token=bebfcba0-3988-459f-8b94-5eadfb95bc5a"
    });
}

function firebaseCheckUser(body){
    var status = database.ref('/users').get().then(function(snapshot){
        var data = snapshot.val();
        for (key in data)
        {
            if(data[String(key)].username == body.username)
            {            
                return false;
            } 
        }
        return true;
    });
    return status;    
}

function firebaseLogin(body){
    var status = database.ref('/users').get().then(function(snapshot){
        var data = snapshot.val();
        for (key in data){
            if(String(data[String(key)].username) == body.username & String(data[String(key)].password) == body.password){  // 
                data[key]["password"] = "";
                data[key]["ID_user"] = String(key);
                return {
                    status : true,
                    body : data[key]
                };
            }
        }
        return {status : false};
    });
    return status;
}

async function firebaseUrlImage(name){
    storage.file('background.jpg').get().then(res =>{
        var name = res[1]['name'];
        var token = res[1]['metadata']['firebaseStorageDownloadTokens'];
        var url = "https://firebasestorage.googleapis.com/v0/b/ichatdatabase.appspot.com/o/"+name+"?alt=media&token="+token;
        return url;
      });
}

async function firebaseAddfriend(ID,body){
    database.ref('friend/'+ID).set(body);
}

async function firebaseFriend(ID_user){

}

async function firebaseSearch(ID_user){
    console.log("____________________________________");
    var friend = await firebaseCheckFriend(ID_user);
    var data = await  database.ref('/users').get().then(res =>{
        var all_users =  res.val();
        for (key in all_users){
            delete all_users[key].background;
            delete all_users[key].email;
            delete all_users[key].password;
            delete all_users[key].url_background;
            delete all_users[key].background;
            delete all_users[key].message_box;
            all_users[key].status = "unfriend";
            all_users[key].ID_friend = "none";
            if (key == ID_user)
            {
                delete all_users[key];
            }     
        }
        
        for (key in friend){
            all_users[key].status = friend[key].status;
            all_users[key].ID_friend = friend[key].ID_friend;
        }
        return all_users;
    });
    return data;
}

async function firebaseCheckFriend(ID){
    
    var buffer = await database.ref('/friend').get().then((result) => {
        var buffer ={};
        var data = result.val();
        for (let key in data){
            if(data[key].ID_user1 == ID){
                buffer[data[key].ID_user2] = {
                    ID_friend : key,
                    status : data[key].status
                };
            }

            if(data[key].ID_user2 == ID){
                if (data[key].status == 'wait'){
                    buffer[data[key].ID_user1] ={
                        ID_friend : key,
                        status : "confirm"
                    };
                }else{
                    buffer[data[key].ID_user1] = {
                        ID_friend : key,
                        status : "friend"
                    };
                }
            }
        }
        return buffer;
    });
    return buffer;
}

async function confirmFreind(ID_friend,status){
    database.ref('/friend/'+ID_friend).update({
        status : 'friend'
    });
}


async function deleteFriend(ID_friend){
    database.ref('/friend/'+ID_friend).remove();
}

async function friendMe(ID){
    var friend = await database.ref('/friend').get().then((result)=>{
        var data = result.val();
        var buffer = [];
        for (let key in data){
            if (data[key].ID_user1 == ID & data[key].status == 'friend'){
                buffer.push(data[key].ID_user2);
            }
            if (data[key].ID_user2 == ID & data[key].status == 'friend'){
                buffer.push(data[key].ID_user1);
            }
        }
        return buffer;
    });
    return friend;
}

async function friendMeInfo(list_firend){
    var buffer = [];
    for(let key of list_firend){
        console.log(key);
        var friend = await database.ref('/users/'+key).get().then((res)=>{
            var data = res.val()
            data["ID_user"] = key
            delete data['password']
            return data
        });
        buffer.push(friend);
    }
    
    return buffer;
}