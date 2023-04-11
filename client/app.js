const peopleContainer = document.querySelector("#peopleContainer");

// fetch("/api/people")
//   .then((response) => response.json())
//   .then((people) => {
//     people.forEach((person) => {
//       peopleContainer.innerHTML += `<div class="peopleDivs"><h1>${person.id}. ${person.name}</h1></div>`;
//       const peopleDivs = document.querySelectorAll(".peopleDivs");
//       addPeopleListeners(peopleDivs);
//     });
//   });

// function addPeopleListeners(divs) {
//   divs.forEach((div) => {
//     div.addEventListener("click", (e) => {
//       //peopleDivs.addEventListener("Click", (e) => {
//       //Clear out anything already in this box
//       const memberContainer = document.getElementById("memberContainer");
//       const hobbyReqContainer = document.getElementById("hobbyReqContainer");
//       memberContainer.innerHTML = "";
//       fetch(`/api/people/${person.id}`)
//         .then((response) => response.json())
//         .then((person) => {
//           console.log(person);
//           memberContainer.innerHTML = `<h2 id="name">Name: ${person.name}</h2><h2 id="nickname">Nickname: ${person.nickname}</h2>
//         <div class="aboutme"><h3 id="aboutMeTitle">About Me:</h3>
//         <p id="aboutMeInfo">My name is ${person.name}, but I go by ${person.nickname}. My favorite color is ${person.fav_color}, I live in ${person.location}, and my birthday is ${person.bday}.:</p>
//         </div>
//         <div class="hobbies"><h3 id="hobbiesTitle">Hobbies:</h3><p id="hobbyInfo">${person.hobby1}, ${person.hobby1}, ${person.hobby1}</p>
//         </div>`;
//           //Want this to work, but for now:
//           //hobbyReqContainer.innerHTML = `<h3 id="hobbiesReq">Hobby requirements: ${person.materials_required}</h3>`;
//           hobbyReqContainer.innerHTML = `<h3 id="hobbiesReq">Hobby requirements: ${person.hobby1}, ${person.hobby2}, ${person.hobby3}</h3>`;
//         });
//     });
//   });
// }

fetch("/api/people")
  .then((response) => response.json())
  .then((people) => {
    people.forEach((person) => {
      const div = document.createElement("div");
      div.classList.add("peopleDivs");
      div.innerHTML = `<h1>${person.id}. ${person.name}</h1>`;
      div.dataset.personId = person.id;
      peopleContainer.appendChild(div);
      addPeopleListeners(div);
    });
  });

function addPeopleListeners(div) {
  div.addEventListener("click", (e) => {
    const personId = e.currentTarget.dataset.personId;
    const memberContainer = document.getElementById("memberContainer");
    const hobbyReqContainer = document.getElementById("hobbyReqContainer");
    //empty out this container if it has anything first
    memberContainer.innerHTML = "";
    fetch(`/api/people/${personId}`)
      .then((response) => response.json())
      .then((person) => {
        console.log(person);
        memberContainer.innerHTML = `<h2 id="name">Name: ${person.name}</h2><h2 id="nickname">Nickname: ${person.nickname}</h2>
        <div class="aboutme"><h3 id="aboutMeTitle">About Me:</h3>
        <p id="aboutMeInfo">My name is ${person.name}, but I go by ${person.nickname}. My favorite color is ${person.fav_color}, I live in ${person.location}, and my birthday is ${person.bday}.</p>
        </div>
        <div class="hobbies"><h3 id="hobbiesTitle">Hobbies:</h3><p id="hobbyInfo">${person.hobby1}, ${person.hobby2}, ${person.hobby3}</p>
        </div>`;
        //Want this to work, but for now:
        //hobbyReqContainer.innerHTML = `<h3 id="hobbiesReq">Hobby requirements: ${person.materials_required}</h3>`;
        hobbyReqContainer.innerHTML = `<h3 id="hobbiesReq">Hobby requirements: ${person.hobby1}, ${person.hobby2}, ${person.hobby3}</h3>`;
      });
  });
}
