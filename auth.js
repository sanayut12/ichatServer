var firebase = require("firebase-admin");

var serviceAccount = require("./serviceFirebase.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://ichatdatabase-28430-default-rtdb.firebaseio.com/",
  storageBucket: "gs://ichatdatabase-28430.appspot.com/"
});


var auth = firebase.auth().createUser({
  email : 'nalin12@gmail.com'
}).then((res)=>{
  console.log(res.uid)
})
