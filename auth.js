var firebase = require("firebase-admin");
const { uuid } = require('uuidv4');
var fs = require('fs')
var serviceAccount = require("./serviceFirebase.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://ichatdatabase-28430-default-rtdb.firebaseio.com/",
  storageBucket:  "gs://ichatdatabase-28430.appspot.com/"
});


// var auth = firebase.auth().createUser({
//   email : 'nalin12@gmail.com'
// }).then((res)=>{
//   console.log(res.uid)
// })

// var image ='data:image/jpeg;base64,'+ fs.readFileSync('./background.jpg',{encoding: 'base64'})

// console.log(image)
// firebase.storage().bucket().file("art1122.jpg").createWriteStream({
//   metadata: {
//     contentType: "image/jpeg"
//   },
  
// }).end(image,{encoding : "base64"})


// var data =  firebase.storage().bucket().file('9055003796.png').get().then((res)=>{
//   var name = res[1]['name'];
//   var token = res[1]['metadata']['firebaseStorageDownloadTokens'];
//   var url = "https://firebasestorage.googleapis.com/v0/b/ichatdatabase-28430.appspot.com/o/"+name+"?alt=media&token="+token;
//   console.log(url)
//   // return urls
// })

// firebase.storage().bucket().file('9055003796.png')

// .then(res=>{
//   console.log(res)
// })

// console.log(data)
async function art(){
  var data = await firebase.storage().bucket().upload('9055003796.png',{
      metadata: {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: uuid()
        }
      }
    }
  ).then(function(res){
  console.log(res[1]['metadata']['firebaseStorageDownloadTokens'])
  return res[1]['metadata']['firebaseStorageDownloadTokens']
  })
  console.log(data)
}

art()




// .save(image, {
//   contentType: "image/jpeg"
//        }, (err) => {
//            if (err) {
//                throw err;
//            } else {
//                functions.logger.debug("NO WAY!")
//            }
//        })
