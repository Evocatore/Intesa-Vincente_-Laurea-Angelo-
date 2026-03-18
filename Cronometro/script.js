const STORAGE_KEY = "cronometro_save";

let time = 0
let timer = null
let activeTeam = 0

const teams = [
  {times: []},
  {times: []}
]

let totals
document.addEventListener('DOMContentLoaded', ()=>{
  totals = document.querySelectorAll(".total span")
})

function updateDisplay(){

  let minutes = Math.floor(time/60000)
  let seconds = Math.floor((time%60000)/1000)
  let cent = Math.floor((time%1000)/10)

  minutes = String(minutes).padStart(2,'0')
  seconds = String(seconds).padStart(2,'0')
  cent = String(cent).padStart(2,'0')

  document.getElementById("display").textContent =
    `${minutes}:${seconds}:${cent}`
}

//#region TIMER
function startTimer(){

  if(timer) return

  timer = setInterval(()=>{
    time += 10
    updateDisplay()
  },10)

  saveTimer()
}

function pauseTimer(){

  clearInterval(timer)
  timer = null

  saveTimer()
}

function resetTimer(){

  clearInterval(timer)
  timer = null

  saveTime(time)

  time = 0
  updateDisplay()

  saveTimer()
}

function addTime(sec){

  time += sec*1000
  if(time < 0) time = 0
  updateDisplay()

}
//#endregion

//#region TEAMS
function selectTeam(index){

  activeTeam = index

  document.querySelectorAll(".team").forEach(t=>t.classList.remove("active"))
  document.getElementById("team"+index).classList.add("active")

  const name = document.querySelector(`#team${index} h2`).innerText
  document.getElementById("activeTeamName").innerText = name

  saveTeam()
}

function removeTime(team,index){

  teams[team].times.splice(index,1)
  renderTeams()

  saveToLocal()
}

function formatTime(t){

  let m = Math.floor(t/60000)
  let s = Math.floor((t%60000)/1000)
  let c = Math.floor((t%1000)/10)

  m = String(m).padStart(2,'0')
  s = String(s).padStart(2,'0')
  c = String(c).padStart(2,'0')

  return `${m}:${s}:${c}`

}

function renderTeams(){

  teams.forEach((team,i)=>{

    const list = document.querySelector(`#team${i} .times`)
    list.innerHTML=""

    team.times.forEach((t,index)=>{

      const li = document.createElement("li")

      li.innerHTML = `
        ${formatTime(t)}
        <button onclick="removeTime(${i},${index})">X</button>
      `

      list.appendChild(li)

    })

    const total = team.times.reduce((a,b)=>a+b,0)

    document.querySelector(`#team${i} .total span`)
      .innerText = formatTime(total)

    checkCurrentWinner()

  })

}
//#endregion

//#region RESULTS
// caricamento dati salvati
document.addEventListener('DOMContentLoaded', () => {
  totals = document.querySelectorAll(".total span");

  // const saved = localStorage.getItem("teamsData");
  // if(saved) {
  //   const parsed = JSON.parse(saved);
  //   // ripristina solo se è un array corretto
  //   if(Array.isArray(parsed) && parsed.length === teams.length) {
  //     parsed.forEach((team,i) => {
  //       teams[i].times = team.times || [];
  //     });
  //   }
  // }

  // renderTeams(); // aggiorna subito la UI

  // const savedTime = localStorage.getItem("currentTime");
  // const savedTeam = localStorage.getItem("activeTeam");

  // if(savedTime) time = parseInt(savedTime);
  // if(savedTeam) activeTeam = parseInt(savedTeam);

  const savedState = localStorage.getItem("gameState");
  if(savedState) {
    const parsed = JSON.parse(savedState);
    if(parsed.teams && Array.isArray(parsed.teams) && parsed.teams.length === teams.length) {
      parsed.teams.forEach((team,i) => {
        teams[i].times = team.times || [];
      });
    }
    if(parsed.currentTime) time = parsed.currentTime;
    if(parsed.activeTeam !== undefined) activeTeam = parsed.activeTeam;
  }

  updateDisplay();
  selectTeam(activeTeam);
});

function resetCurrentWinner(){
  totals.forEach(t=>t.parentElement.classList.remove("current-winner"))
}

function checkCurrentWinner(){
  // if (teams.every(t=>t.times.length == 0)){
  resetCurrentWinner()
  //   return
  // }

  if (totals.length < 2) return

  if (totals[1].textContent < totals[0].textContent){
    totals[1].parentElement.classList.add("current-winner")
    totals[0].parentElement.classList.remove("current-winner")
  }
  else if (totals[0].textContent < totals[1].textContent){
    totals[0].parentElement.classList.add("current-winner")
    totals[1].parentElement.classList.remove("current-winner")
  }
}
//#endregion

//#region SALVATAGGIO
function saveState() {
  const state = {
    teams,
    currentTime: time,
    activeTeam
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveTimer() {
  saveState();
}

function saveTeam() {
  saveState();
}

function saveTime(t) {
  if(t <= 0) return;

  teams[activeTeam].times.push(t);
  renderTeams();
  saveState();
}

function resetAll() {
  // Ferma il timer
  clearInterval(timer);
  timer = null;

  // Azzera il tempo
  time = 0;
  updateDisplay();

  // Azzera i team
  teams.forEach(team => team.times = []);
  renderTeams();

  // Reset team attivo a 0
  activeTeam = 0;
  selectTeam(activeTeam);

  // Rimuove tutto dal localStorage
  localStorage.removeItem(STORAGE_KEY);
}
//#endregion