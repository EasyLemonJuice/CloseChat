const url = "https://ccapi.onrender.com"
const urlParams = new URLSearchParams(window.location.search);

let chat = document.getElementById('chat')
let user = document.getElementById('name')
let cancel = document.querySelector('.cancel')
let error = document.querySelector('.error')
let loading = cancel.parentElement

let page = "chat"
let inQueue = false;

localStorage.loaded = false;

let errorCode = localStorage.errorCode
if (errorCode == "1"){
  error.textContent = "Other player disconnected"
  error.classList.add("visible")
  setTimeout(function(){
    error.classList.remove("visible")
  },2000)
}else if (errorCode == "2"){
  error.textContent = "Room not found"
  error.classList.add("visible")
  setTimeout(function(){
    error.classList.remove("visible")
  },2000)
}
localStorage.errorCode = ""

if (localStorage.room & localStorage.room != ""){
  window.location.href = page+"?id="+localStorage.room
}

if (localStorage.userid != "" && localStorage.userid){
  fetch(url+'/clearQueue',{method:"POST",body: JSON.stringify({'id':localStorage.userid})});
}else{
  localStorage.userid = makeid(5)
}

randomNames = ["Smiling joker","Dancing dad","Father less","Black balloon","Green giraffe","Drunk driver"]
if (localStorage.username != "" && localStorage.username){
  user.value = localStorage.username;
}else{
  const nameChosen = randomNames[Math.floor(Math.random() * randomNames.length)];
  user.value = nameChosen
}


setInterval(()=>{
  if (user.value == " "){
    user.value = ""
  }
  if (user.value == ""){
    localStorage.username = "Unnamed"
  }else{
    localStorage.username = user.value
  }
},10)

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

async function queue(){
  const response = await fetch(url+'/queue',{method:"POST",body: JSON.stringify({'name':localStorage.username,'userid':localStorage.userid})});
}

function exitRoom(){
  if (localStorage.room && localStorage.room!=""){
    fetch(url+'/clearRoom',{method:"POST",body: JSON.stringify({'id':localStorage.room})})
  }
}

async function update(){
  const response = await fetch(url+'/updateQueue',{method:"POST",body: JSON.stringify({'ignore':'', 'name':localStorage.username,'id':localStorage.userid})});
  var data = await response.json();
  if (data['code']!=""){
    localStorage.room = data['code']
    window.location.href = page+"?id="+data['code']
  }
}

exitRoom()
cancel.addEventListener("click",()=>{
  window.location.href = "index.html"
})
chat.addEventListener("click",()=>{
  loading.classList.remove('invis')
  if (inQueue == false){
    inQueue = true;
    queue()
    setInterval(()=>{
      update()
    },500)
  }
})
