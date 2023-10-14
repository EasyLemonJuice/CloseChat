const url = "https://ccapi.onrender.com"
const urlParams = new URLSearchParams(window.location.search);

let inQueue = false;
let page = "chat.html"

let message = document.querySelector(".message").cloneNode(true)
let server = document.querySelector(".server").cloneNode(true)

let yourName = localStorage.username
let roomCode = urlParams.get("id")

document.querySelector(".message").remove()
document.querySelector(".server").remove()

let lastMax = 0

let chats = document.querySelector(".chatBox")
let chatBox = document.querySelector(".chats")
let textBox = document.querySelector(".textBox")
let skip = document.querySelector(".skip")
let home = document.querySelector(".home")

let cancel = document.querySelector('.cancel')
let loading = cancel.parentElement

let chatId = "hasd123"

async function loadRoom(code){
  const response = await fetch(url+'/rooms');
  var data = await response.json();
  data.forEach((room)=>{
    if (room["id"]==code){
      load(room["messages"])
    }
  })
}

function convertTime(date){
  let year = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  let strTime = year + " at "+ hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function exitRoom(){
  if (localStorage.room && localStorage.room!=""){
    fetch(url+'/clearRoom',{method:"POST",body: JSON.stringify({'id':localStorage.room})})
  }
}
cancel.addEventListener("click",()=>{
  window.location.href = "index.html"
})
function sendMessage(){
  let text = textBox.value;
  if (text.length > 0){
    let date = convertTime(new Date())
    fetch(url+'/message',{method:"POST",body: JSON.stringify({'id':roomCode, 'type':"message",'name':yourName,'date':date,'content':text})})
  }
  textBox.value = "";
  setTimeout(function(){
    loadRoom(roomCode)
  },10)
  
}

function load(msgs){
  let index = 0
  msgs.forEach((obj)=>{
    index+=1
    let id = ""
    if (!document.getElementById(index.toString())){
      let node
      if (obj.type == "message"){
        node = message.cloneNode(true);
        let contdex = 0
        obj.content.forEach((string)=>{
          contdex+=1
          let contentNode = node.querySelector(".content").cloneNode(true);
          contentNode.textContent = string;
          contentNode.id = "C"+contdex.toString()
          node.append(contentNode);
        })
        if (obj.name == yourName){
          node.classList.add("you")
        }else{
          node.classList.add("other")
        }
      }else if (obj.type = "server"){
        node = server.cloneNode(true);
      }
      node.querySelector(".name").textContent = obj.name;
      node.querySelector(".date").textContent = obj.date;
      node.id = index.toString()


      chatBox.append(node);
    }else{
      if (obj.type == "message"){
        let prev = document.getElementById(index.toString())
        let contdex = 0
        obj.content.forEach((string)=>{
          contdex+=1
          let s = "#C"+contdex.toString()
          if (!prev.querySelector(s)){
            let contentNode = prev.querySelector(".content").cloneNode(true);
            contentNode.textContent = string;
            contentNode.id = "C"+contdex.toString()
            prev.append(contentNode);
          }
        })
      }
    }
  })
  if (chats.scrollTop >= lastMax-65 & lastMax != chats.scrollHeight - chats.clientHeight ){
    chats.scrollTo({ top: chats.scrollHeight - chats.clientHeight, behavior: 'smooth' })
  }
  lastMax = chats.scrollHeight - chats.clientHeight
}

textBox.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

skip.addEventListener('click',()=>{
  localStorage.loaded = false;
  inQueue = true;
  exitRoom()
  loading.classList.remove('invis')
  queue()
  setInterval(()=>{
    update()
  },500)
})
home.addEventListener('click',()=>{
  exitRoom()
  window.location.href = "index.html"
})

async function loadRoom(code){
  const response = await fetch(url+'/rooms');
  var data = await response.json();
  let roomFound = false;
  data.forEach((room)=>{
    if (room["id"]==code){
      load(room["messages"])
      if (localStorage.loaded == 'false'){
        let date = convertTime(new Date())
        fetch(url+'/message',{method:"POST",body: JSON.stringify({'id':roomCode, 'type':"server",'name':yourName+" joined the room",'date':date})})
      }
      localStorage.loaded = true;
      roomFound = true;
    }
  })
  if (!roomFound && !inQueue){
    if (localStorage.loaded == 'true'){
      localStorage.errorCode = "1"
    }else {
      localStorage.errorCode = "2"
    }
    window.location.href = "index.html"
  }
}

async function queue(){
  const response = await fetch(url+'/queue',{method:"POST",body: JSON.stringify({'name':localStorage.username,'userid':localStorage.userid})});
}

async function update(){
  const response = await fetch(url+'/updateQueue',{method:"POST",body: JSON.stringify({'ignore':'', 'name':localStorage.username,'id':localStorage.userid})});
  var data = await response.json();
  console.log(data)
  if (data['code']!=""){
    localStorage.room = data['code']
    window.location.href = page+"?id="+data['code']
  }
}

setInterval(()=>{
  try {
    loadRoom(roomCode)
  }catch{}
},500)
