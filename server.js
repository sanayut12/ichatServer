const express = require('express');
var firebase = require("firebase-admin");
const random = require('random');
var fs = require('fs')
const { uuid } = require('uuidv4');
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
  databaseURL: "https://ichatdatabase-28430-default-rtdb.firebaseio.com/",
  storageBucket: "gs://ichatdatabase-28430.appspot.com/"
});
var database = firebase.database();
var storage = firebase.storage().bucket();
var auth  =firebase.auth()
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

    var uid = await auth.createUser({
        email : body.email
    }).then((res)=>{
        return res.uid
    })
    
    body["uid"] = uid
    var status = await firebaseCheckUser(body);   //return trye or false   use check user duoble
    console.log(body)
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
    // console.log(body);
    console.log('----------dddd--------------------')
    var list_friend= await friendMe2(body.ID);
    // console.log(key)
    // console.log(list_friend)
    // console.log("list friend"+list_friend)
    var friend =await friendMeInfo(list_friend['friendID']);
    for (let i in friend){
        friend[i]['key_friend'] = list_friend['friendKey'][i]
    }
    res.send(friend);
    ///

    // res.send(null)
});

app.post('/postFeed',async function(req,res){
    var id_post = randomID()
    var imageName = randomID()+'.png'
    var date = Date.now()

    var body = {
        image :  req.body.image, //base64 
        id_post : id_post,
        ID : req.body.ID,
        message : req.body.message,
        imageName : imageName,
        date : date
    }
    // console.log(body)
    
    await firebasePostFeed(body)
    res.send({message :"hello123"})

})

app.post('/changeimageProfile',async function(req,res){
    var imageName = randomID()+'.png'


    var body = {
        image :  req.body.image, //base64 
        ID : req.body.ID,
        imageName : imageName,
    }
    console.log(body)
    var img =  await changeImageProfile(body)
    // console.log(body)
    res.send({image :img})

})

app.post('/changeimagebacbground',async function(req,res){
    var imageName = randomID()+'.png'


    var body = {
        image :  req.body.image, //base64 
        ID : req.body.ID,
        imageName : imageName,
    }
    console.log(body)
    var img =  await changeImageBackground(body)
    // console.log(body)
    res.send({imagebackground :img})
})

app.post('/feed',async function(req,res){
    var body = {
        ID : req.body.ID
    }
    var list_friend = await friendMe(body.ID);
    list_friend.push(body.ID)
    // console.log(list_friend)
    var postDetail = await feedFriend(list_friend)
    // console.log(postDetail)
    var feedlast = sortFeed(postDetail)
    console.log("feed ")
    console.log(feedlast)
    res.send({
        message : feedlast
    })
})

app.post('/commentpost',async (req,res)=>{
    var body = {
        id_post : req.body.id_post,
        ID_userComment : req.body.ID_userComment,
        name : req.body.name,
        image_profile : req.body.image_profile ,
        message : req.body.message
    }
    console.log(body)
    await CommentPost(body)
    res.send({
        message : "hello"
    })
})

app.post('/getcommentpost',async (req,res)=>{
    var body = {
        id_post : req.body.id_post,
    }
    var data = await getCommentPost(body)
    res.send({
        data : data
    })
})

app.post('/love',async (req,res)=>{
    var body = {
        ID : req.body.ID,
        id_post : req.body.id_post 
    }
    console.log('------love------')
    console.log(body)
    var data = await lovepost(body)
    // console.log(data)
    res.send(data)
})

app.post('/getlove',async (req,res)=>{
    var body = {
        ID : req.body.ID,
        id_post : req.body.id_post 
    }
    console.log('------love post------')
    console.log(body)
    var data = await getlovepost(body)
    // console.log(data)
    res.send(data)
})

app.post('/get_post_me',async (req,res)=>{
    var body = {
        ID : req.body.ID
    }
    // console.log('--------------------------get post me ------------------')
    // console.log(body)

    var list = await getPostMe(body)
    var data = await sortFeed(list)
    // console.log(data)

    // for (let i in data){
    //     console.log(new Date(data[i]['date']) )
    // }
    res.send(data)
})

app.post('/firendInteractive',async (req,res)=>{
    var body = {
        ID : req.body.ID
    }
    // console.log(body)
    var data = await deleteNofriend(body.ID)// firebaseCheckFriend()
    // console.log(data)
    res.send(data)
})

app.post('/getUserInteractive',async (req,res)=>{
    var body = {
        ID : req.body.ID
    } 
    var list = await  findfriendRequestID(body.ID)//??????????????????????????????????????? ????????????????????????add ?????????
    var data = await findfriendRequest(list)
    // console.log(data)
    res.send(data) 
})

app.post('/getMessage',async (req,res)=>{

    var body = {
        ID_friend : req.body.ID_friend
    }
    console.log(body)
    var list_message =  await getMessageChat(body.ID_friend)
    console.log(list_message)
    res.send({
        list : list_message
    })
})


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

async function getMessageChat(ID_friend){
    var message_list  = await database.ref('message/'+ID_friend).get().then((res)=>{
        var buffer = []
        var data = res.val()
        console.log(data)
        for (let i in data){
            // console.log(i)
            buffer.push(data[i])
        }

        return buffer
    })

    return message_list
}

async function findfriendRequest(list){
    // console.log(list)
    var bufferReq = await friendMeInfo(list['userReq'])
    var bufferRes = await friendMeInfo(list['userRes'])
    for (let i in bufferReq){
        // console.log(i)
        bufferReq[i]["ID_post"] = list['keyReq'][i]
    }
    for (let i in bufferRes){
        // console.log(i)
        bufferRes[i]["ID_post"] = list['keyRes'][i]
    }
    
    return {
        userReq : bufferReq,
        userRes : bufferRes
    }
}

async function findfriendRequestID(ID){
    var buffer = await database.ref('/friend').get().then((result) => {
        var bufferReq =[];
        var bufferRes =[];
        var bufferReqKey = []
        var bufferResKey = []
        var data = result.val();
        if (data == null){
            return null
        }else{
            for (let key in data){
                //???????????? id ?????????(1) ???????????????????????? ??????????????? wait ?????????
                if(data[key].ID_user1 == ID && data[key].status == 'wait'){
                    bufferReq.push(data[key].ID_user2)
                    bufferReqKey.push(key)
                }
            }
            for (let key in data){
                //???????????? id ?????????2 ??????????????????????????????????????????????????????
                if(data[key].ID_user2 == ID && data[key].status == 'wait'){
                    bufferRes.push(data[key].ID_user1)
                    bufferResKey.push(key)
                }
            }
        }        
        return {
            userReq : bufferReq,
            userRes : bufferRes,
            keyReq : bufferReqKey,
            keyRes : bufferResKey
        };
    });
    return buffer;
}

async function deleteNofriend(ID){
    var  buffer = []
    var data = await firebaseSearch(ID)
    // console.log(data)
    for (let item in data){
        delete data[item]['image']
        delete data[item]['uid']
        
        if (data[item]['status'] == 'unfriend' || data[item]['status'] == 'confirm' || data[item]['status'] == 'wait'){
            delete data[item]
        }
    }

    for (let i in data){
        data[i]['id_table_friend'] = i
        delete data[i]['status']
        buffer.push(data[i])
    }
    return buffer
}

async function getPostMe(body){
    var buffer = []
    await database.ref('/post/'+body.ID).get().then((res)=>{
        var buffer2 = []
        var data2 = res.val()
        if (data2 == null){
            return null
        }else{
            // console.log(data2)
            delete data2['9999999999']
            for (let k in data2){
                data2[k]['ID_post'] = k
                buffer2.push(data2[k])
            }
            
            for (let item of buffer2){
                buffer.push(item)
            }
        }
        
        
    })
    // console.log(buffer)

    return buffer;
}

async function lovepost(body){
    return database.ref('lovePost/'+body.id_post).get().then( (res)=>{
        
        let data  = res.val()
        // console.log(data)
        
        if (data == null){
            database.ref('lovePost/'+body.id_post).push({
                ID : body.ID
            })
            return {
                count : 1,
                userlove : true
            }
        } else{
            var loveCount = Object.keys(data).length
            var check = false
            var index = "dd"
            for (let i in data){
                console.log(i)
                console.log(data[i])
                if (data[i]['ID']==body.ID){
                    check = true
                    index = i
                }
            }
            console.log(loveCount)
            console.log(check)
            console.log(index)

            if (check){
                database.ref('lovePost/'+body.id_post+'/'+index).remove()
                return {
                    count : loveCount-1,
                    userlove : false
                }
            }else{
                database.ref('lovePost/'+body.id_post).push({
                    ID : body.ID
                })
                return {
                    count : loveCount+1,
                    userlove : true
                }
            }

            
        }
        // return "hell0"
    })

    
}
async function getlovepost(body){
    return database.ref('lovePost/'+body.id_post).get().then( (res)=>{
        
        let data  = res.val()
        // console.log(data)
        
        if (data == null){
            return {
                count : 0,
                userlove : false
            }
        } else{
            var loveCount = Object.keys(data).length
            var check = false
            var index = "dd"
            for (let i in data){
                console.log(i)
                console.log(data[i])
                if (data[i]['ID']==body.ID){
                    check = true
                    index = i
                }
            }
            console.log(loveCount)
            console.log(check)
            console.log(index)

            if (check){
                return {
                    count : loveCount,
                    userlove : true
                }
            }else{
                return {
                    count : loveCount,
                    userlove : false
                }
            }

            
        }
        // return "hell0"
    })

    
}

async function getCommentPost(body){
    return await database.ref('comment/'+body.id_post).get().then((res)=>{
        var data = res.val()
        if(data == null){     //????????? ????????????????????????????????????????????????????????????
            return null
        }else{
            var buffer = []
            for (let key in data){
                console.log(key)
                buffer.push(data[key])
            }
            return buffer
        }
    })
}
function CommentPost(body){
    database.ref('comment/'+body.id_post).push({
        ID_userComment :body.ID_userComment,
        name : body.name,
        image_profile : body.image_profile ,
        message : body.message
    }).then((res)=>{
        console.log(res)
    })
}


function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

function firebaseRegister(ID,body) {
    database.ref('users/' + ID).set({
        uid : body.uid,
        username: body.username,
        password:body.password,
        email: body.email,
        message_box:"",
        image : "none",
        url_image : "https://firebasestorage.googleapis.com/v0/b/ichatdatabase.appspot.com/o/person.png?alt=media&token=dde8bc88-68fa-409e-a344-08bc98bb3c89",
        background : "none",
        url_background : "https://firebasestorage.googleapis.com/v0/b/ichatdatabase.appspot.com/o/background.jpg?alt=media&token=bebfcba0-3988-459f-8b94-5eadfb95bc5a"
    });

    database.ref('post/' + ID).set({
        9999999999 : "none"
    })
}
function sortFeed(list){
    var len = list.length
    // console.log(" sort function :"+len)
    for (let i = 0;i<len-1;i++){
        // console.log("i : " +i)
        for (let k = 0;k<len-1;k++){
            // console.log("K" + k)
            if (list[k]["date"] < list[k+1]["date"]){
                // console.log( list[k]["date"] +" : "+list[k+1]["date"])
                var buff = list[k] 
                list[k] = list[k+1]
                list[k+1] = buff
            } 
            
        } 

    }
    // console.log(list)

    return list
}

async function firebasePostFeed(body) {
    await fs.writeFileSync(body.imageName,body.image,{encoding: 'base64'})

    var token = await storage.upload(body.imageName,{
        metadata: {
            contentType: 'image/png',
            metadata: {
              firebaseStorageDownloadTokens: uuid()
            }
          }
    }).then(function(res){
        return res[1]['metadata']['firebaseStorageDownloadTokens']
        })
    var urlimage = "https://firebasestorage.googleapis.com/v0/b/ichatdatabase-28430.appspot.com/o/"+body.imageName+"?alt=media&token="+token;
    console.log(urlimage)

    database.ref('/post/'+body.ID+'/'+body.id_post).set({
        message : body.message,
        url : urlimage,
        date : body.date
    })

    fs.unlinkSync(body.imageName)
}

async function changeImageProfile(body) {

    await fs.writeFileSync(body.imageName,body.image,{encoding: 'base64'})

    var token = await storage.upload(body.imageName,{
        metadata: {
            contentType: 'image/png',
            metadata: {
              firebaseStorageDownloadTokens: uuid()
            }
          }
    }).then(function(res){
        return res[1]['metadata']['firebaseStorageDownloadTokens']
        })
    var urlimage = "https://firebasestorage.googleapis.com/v0/b/ichatdatabase-28430.appspot.com/o/"+body.imageName+"?alt=media&token="+token;
    // console.log(urlimage)

    database.ref('/users/'+body.ID).update({
        url_image : urlimage,
    })

    fs.unlinkSync(body.imageName)
    return urlimage
}

async function changeImageBackground(body) {

    await fs.writeFileSync(body.imageName,body.image,{encoding: 'base64'})

    var token = await storage.upload(body.imageName,{
        metadata: {
            contentType: 'image/png',
            metadata: {
              firebaseStorageDownloadTokens: uuid()
            }
          }
    }).then(function(res){
        return res[1]['metadata']['firebaseStorageDownloadTokens']
        })
    var urlimage = "https://firebasestorage.googleapis.com/v0/b/ichatdatabase-28430.appspot.com/o/"+body.imageName+"?alt=media&token="+token;
    // console.log(urlimage)

    database.ref('/users/'+body.ID).update({
        url_background : urlimage,
    })

    fs.unlinkSync(body.imageName)
    return urlimage
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
        var url = "https://firebasestorage.googleapis.com/v0/b/ichatdatabase-28430.appspot.com/o/"+name+"?alt=media&token="+token;
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
async function friendMe2(ID){
    var friend = await database.ref('/friend').get().then((result)=>{
        var data = result.val();
        var buffer = [];
        var bufferkey = []
        for (let key in data){
            if (data[key].ID_user1 == ID & data[key].status == 'friend'){
                buffer.push(data[key].ID_user2);
                bufferkey.push(key)
            }
            if (data[key].ID_user2 == ID & data[key].status == 'friend'){
                buffer.push(data[key].ID_user1);
                bufferkey.push(key)
            }
        }
        return {
            friendID : buffer,
            friendKey : bufferkey
        };
    });
    return friend;
}


async function feedFriend(list){
    var buffer = []

    for(let key of list){
        // console.log(key);
        var friend = await database.ref('/users/'+key).get().then((res)=>{
            var data = res.val()
            data["ID_user"] = key
            delete data['password']
            delete data['image']
            delete data['background']
            delete data['email']
            delete data['uid']
            delete data['url_background']
            delete data['message_box']
            return data
        });
        await database.ref('/post/'+key).get().then((res)=>{
            var buffer2 = []
            var data2 = res.val()
            delete data2['9999999999']
            for (let k in data2){
                // console.log(k)
                data2[k]['ID_post'] = k
                data2[k]['ID_user'] = key
                data2[k]['image_profile'] = friend['url_image']
                data2[k]["name"] = friend['username']
                buffer2.push(data2[k])
            }
            
            for (let item of buffer2){
                buffer.push(item)
            }
            
        })
    }
    // console.log(buffer)
    return buffer;
}

async function friendMeInfo(list_firend){
    if (list_firend == null){
        return null
    }
    var buffer = [];
    for(let key of list_firend){
        // console.log(key);
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
