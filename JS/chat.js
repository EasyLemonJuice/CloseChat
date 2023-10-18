const url = "https://ccapi.onrender.com"
const urlParams = new URLSearchParams(window.location.search);

let inQueue = false;
let page = "chat.html"

let message = document.querySelector(".message").cloneNode(true)
let image = document.querySelector(".image").cloneNode(true)
let server = document.querySelector(".server").cloneNode(true)

let cam = document.querySelector(".imageCam")
let stop = document.querySelector(".stop")
let send = document.querySelector(".send")

let fileUpload = document.querySelector(".fileInput")

let yourName = localStorage.username
let roomCode = urlParams.get("id")
let roomName = urlParams.get("name")
if (roomName && roomName != ""){
  document.querySelector('.title').textContent = roomName
}

document.querySelector(".message").remove()
document.querySelector(".image").remove()
document.querySelector(".server").remove()

const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);

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
  const response = await fetch(url+'/getRoom',{method:"POST",body: JSON.stringify({'id':code})});
  var data = await response.json();
  load(data)
}

async function loadImage(code,image){
  const response = await fetch(url+'/getImage',{method:"POST",body: JSON.stringify({'id':code})});
  image.src = await response.json();
}

function convertTime(date){
  let year = date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  let strTime = year + " at "+ hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function camera(on){
  if (on){
    cam.classList.remove("invis")
    webcam.start()
       .then(result =>{
          console.log("webcam started");
       })
       .catch(err => {
           console.log(err);
       });
  }else{
    webcam.stop()
    cam.classList.add("invis")
  }
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
    fetch(url+'/message',{method:"POST",body: JSON.stringify({'id':roomCode, 'type':"message",'name':yourName,'date':date,'content':text,'userid':localStorage.userid})})
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
      }else if (obj.type == "server"){
        node = server.cloneNode(true);
      }else if (obj.type == "image"){
        node = image.cloneNode(true);
        obj.content.forEach((string)=>{
          let contentNode = node.querySelector(".content").cloneNode(true);
          contentNode.classList.remove("invis")
          let id = parseInt(string.substring(35))
          loadImage(id,contentNode)
          node.append(contentNode);
        })
        if (obj.name == yourName){
          node.classList.add("you")
        }else{
          node.classList.add("other")
        }
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
  const response = await fetch(url+'/getRoom',{method:"POST",body: JSON.stringify({'id':code})});
  var room = await response.json();
  if (!room || room == {}){
    if (!inQueue){
      if (localStorage.loaded == 'true'){
        localStorage.errorCode = "1"
      }else {
        localStorage.errorCode = "2"
      }
    }
    window.location.href = "index.html"
  }
  }
  load(room["messages"])
  if (localStorage.loaded == 'false'){
    let date = convertTime(new Date())
    fetch(url+'/message',{method:"POST",body: JSON.stringify({'id':roomCode, 'type':"server",'name':yourName+" joined the room",'date':date,'userid':'serverMessage'})})
  }
  localStorage.loaded = true;
}

async function queue(){
  const response = await fetch(url+'/queue',{method:"POST",body: JSON.stringify({'name':localStorage.username,'userid':localStorage.userid})});
}
document.querySelector(".fileButton").addEventListener('click',()=>{
  fileUpload.click()
})
document.querySelector(".cameraButton").addEventListener('click',()=>{
  camera(true)
})
stop.addEventListener('click',()=>{
  camera(false)
})
send.addEventListener('click',()=>{
  let date = convertTime(new Date())
  fetch(url+'/message',{method:"POST",body: JSON.stringify({'id':roomCode, 'type':"image",'name':yourName,'date':date,'content':webcam.snap(),'userid':localStorage.userid})})
  camera(false)
})
async function update(){
  const response = await fetch(url+'/updateQueue',{method:"POST",body: JSON.stringify({'ignore':'', 'name':localStorage.username,'id':localStorage.userid})});
  var data = await response.json();
  console.log(data)
  if (data['code']!=""){
    localStorage.room = data['code']
    window.location.href = page+"?id="+data['code']
  }
}
fileUpload.onchange = function () {
  let file = fileUpload.files[0],
    reader = new FileReader();

  reader.onloadend = function () {
    let b64 = reader.result;
    if (b64 && roomCode){
      fileUpload.value = ""
      let date = convertTime(new Date())
      fetch(url+'/message',{method:"POST",body: JSON.stringify({'id':roomCode, 'type':"image",'name':yourName,'date':date,'content':b64,'userid':localStorage.userid})})
    }
  };

  reader.readAsDataURL(file);
};
setInterval(()=>{
  try {
    loadRoom(roomCode)
  }catch{}
},500)
