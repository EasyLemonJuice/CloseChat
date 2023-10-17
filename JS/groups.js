let url = "https://ccapi.onrender.com"
let groupElement = document.querySelector(".roomButton").cloneNode(true)
document.querySelector(".roomButton").remove()

rooms = {}

async function update(){
  const response = await fetch(url+'/getRooms',{method:"POST",body: JSON.stringify({'id':localStorage.userid})});
  rooms = await response.json();

  for (let room in rooms){
    if (!document.getElementById(rooms[room])){
      let button = groupElement.cloneNode(true);
      button.textContent = room+" (ID:"+rooms[room]+")";
      button.id = rooms[room];
      button.onclick = () =>{
        window.location.href = "chat.html?id="+rooms[room]+"&name="+room
      }
      document.querySelector('.myRooms').append(button);
    }
  }
}

document.querySelector(".join").addEventListener("click",()=>{
  let name = document.querySelector('.joinval').value
  fetch(url+'/joinRoom',{method:"POST",body: JSON.stringify({'id':localStorage.userid,'roomCode':name})});
})

document.querySelector(".create").addEventListener("click",()=>{
  let name = document.querySelector('.createval').value
  console.log(name);
  if (name.length > 0){
    fetch(url+'/createRoom',{method:"POST",body: JSON.stringify({'id':localStorage.userid,'name':name})});
  }
  update();
})

update()
setInterval(()=>{
  update()

},1000)
