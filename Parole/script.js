let activeTeam = 0
const maxPass = 2

const words_team0 = [
  "CANE",
  "MONTAGNA",
  "BICICLETTA",
  "PIZZA",
]

const words_team1 = [
  "TELEFONO",
  "ASTRONAUTA",
  "LIBRO",
  "MARE"
]

const words = [
  {words:words_team0, currentIndex:-1, ended:false, pass:maxPass},
  {words:words_team1, currentIndex:-1, ended:false, pass:maxPass}
]

const teams = [
  {words:[]},
  {words:[]}
]

function startGame(){

  document.getElementById("startBtn").style.display="none"
  document.getElementById("wordArea").style.display="block"

  nextWord()

}

//#region WORDS
function nextWord(){

  const current = words[activeTeam]
  current.currentIndex++

  document.querySelectorAll(".word-actions button").forEach(b => b.disabled = false)

  if(current.currentIndex >= current.words.length){
    document.getElementById("wordDisplay").innerText="FINE"
    current.ended = true
    const btns = document.querySelectorAll("#wordArea button")
    btns.forEach(b => b.disabled = true)
    return
  }

  document.getElementById("wordDisplay").innerText = current.words[current.currentIndex]

  saveGame();
}

function markWord(correct){

  if(!correct)
  {
    if(words[activeTeam].pass <= 0)
    {
      alert(`Non puoi utilizzare più di ${maxPass} passo`)
      return
    }
    words[activeTeam].pass--
  }

  const word = words[activeTeam].words[words[activeTeam].currentIndex]

  teams[activeTeam].words.push({
    text:word,
    correct:correct
  })

  renderTeams()
  checkCurrentWinner()

  document.getElementById("wordDisplay").innerText = "-"
  const btns = document.querySelectorAll(".word-actions button")
    btns.forEach(b => b.disabled = true)

    saveGame();
}

function renderTeams(){

  teams.forEach((team,i)=>{

    const list = document.querySelector(`#team${i} .words`)
    list.innerHTML=""

    team.words.forEach((w,index)=>{

      const li = document.createElement("li")

      const symbol = w.correct ? "✔" : "↷"
      const className = w.correct ? "word-ok" : "word-pass"

      li.innerHTML = `
        <span class="${className}">
          ${w.text} ${symbol}
        </span>
        <button onclick="removeWord(${i},${index})">X</button>
      `

      list.appendChild(li)

    })

  })

}

function removeWord(team,index){
  teams[team].words.splice(index,1)
  renderTeams()
  checkCurrentWinner()
  saveGame();
}
//#endregion

function checkCurrentWinner() {
  const teamElems = document.querySelectorAll(".team")

  const count0 = teams[0].words.filter(w => w.correct).length
  const count1 = teams[1].words.filter(w => w.correct).length

  teamElems.forEach(t => t.classList.remove("current-winner"))

  if(count0 === 0 && count1 === 0) return

  if(count0 > count1){
    teamElems[0].classList.add("current-winner")
  } else if(count1 > count0){
    teamElems[1].classList.add("current-winner")
  } 
}

function selectTeam(index){

  activeTeam = index

  // evidenzia la squadra
  document.querySelectorAll(".team").forEach(t=>t.classList.remove("active"))
  document.getElementById("team"+index).classList.add("active")

  // aggiorna header
  const name = document.querySelector(`#team${index} h2`).innerText
  document.getElementById("activeTeamName").innerText = name

  // aggiorna wordDisplay
  const wordArea = document.getElementById("wordArea")
  const current = words[activeTeam]
  const startBtn = document.getElementById("startBtn")

  if(current.currentIndex === -1){
    startBtn.style.display = "block"
    wordArea.style.display = "none"
  } else {
    startBtn.style.display = "none"
    wordArea.style.display = "block"

    // aggiorna wordDisplay
    if(current.currentIndex >= current.words.length){
      document.getElementById("wordDisplay").innerText = "FINE"
    } else {
      document.getElementById("wordDisplay").innerText = current.words[current.currentIndex]
    }

    // riabilita i bottoni se il gioco non è finito
    const btns = document.querySelectorAll("#wordArea button")
    btns.forEach(b => {
      b.disabled = current.currentIndex >= current.words.length
    })
  }

  saveGame();
}

// caricamento dati salvati
document.addEventListener('DOMContentLoaded', ()=>{
  loadGame();
});

function saveGame() {
  const data = {
    words: words.map(w => ({
      currentIndex: w.currentIndex,
      ended: w.ended,
      pass: w.pass
    })),
    teams: teams.map(t => ({ words: t.words })),
    activeTeam: activeTeam
  };
  localStorage.setItem("gameData", JSON.stringify(data));
}

function loadGame() {
  const saved = localStorage.getItem("gameData");
  if(!saved) return;

  const data = JSON.parse(saved);

  // Ripristina lo stato delle parole
  data.words.forEach((w,i) => {
    words[i].currentIndex = w.currentIndex;
    words[i].ended = w.ended;
    words[i].pass = w.pass;
  });

  // Ripristina parole dei team
  data.teams.forEach((t,i) => {
    teams[i].words = t.words || [];
  });

  // Ripristina squadra attiva
  if(data.activeTeam != null) activeTeam = data.activeTeam;

  // Aggiorna UI
  renderTeams();
  checkCurrentWinner();
  selectTeam(activeTeam);
}

function resetGame() {
  localStorage.removeItem("gameData");

  // Reset logico
  words.forEach((w,i) => {
    w.currentIndex = -1;
    w.ended = false;
    w.pass = maxPass;
  });
  teams.forEach(t => t.words = []);
  activeTeam = 0;

  renderTeams();
  checkCurrentWinner();
  selectTeam(activeTeam);

  document.getElementById("startBtn").style.display = "block";
  document.getElementById("wordArea").style.display = "none";
}