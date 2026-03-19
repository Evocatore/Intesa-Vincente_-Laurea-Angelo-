const STORAGE_KEY = "wordGameData";

let activeTeam = 0
const maxPass = 5

const words_team0 = [  // Squadra Angelo
"Ostensorio",
"Cicirinella",
"Turbofan",
"Flap",
"Kashakas",
"Galbusera",
"Langian",
"Winglets",
"Strumming",
"Theremin",
"Transustanziazione",
"Kutta-Joukowski",
"Armonica a bocca",
"Debussy",
"Mo ve ciccin ng lu battell"
]

const words_team1 = [  // Squadra Contendente
"Zucchetto",
"Fornacella",
"Reynolds",
"Weierstrass",
"Ocarina",
"Bagnèt verd",
"Transumanza",
"Portanza",
"Ukulele",
"Sitar",
"Ambone",
"Chebyshev",
"Clavicembalo",
"Rachmaninov",
"Ce l'avete una casa?"
]

let words = [
  {words:words_team0, currentIndex:-1, ended:false, pass:maxPass},
  {words:words_team1, currentIndex:-1, ended:false, pass:maxPass}
]

let teams = [
  {words:[]},
  {words:[]}
]

function startGame(){

  document.getElementById("startBtn").style.display="none"
  document.getElementById("wordArea").style.display="block"

  nextWord()

}

//#region WORDS
let typingInterval = null;

function typeWriter(text, elementId, typingTime = 50) {
  const el = document.getElementById(elementId);
  const sound = document.getElementById("typeSound");

  // ferma eventuali animazioni precedenti
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }

  el.innerText = "";
  el.classList.add("typing");

  let i = 0;

  typingInterval = setInterval(() => {
    el.innerText += text[i];

    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }

    i++;

    if (i >= text.length) {
      clearInterval(typingInterval);
      typingInterval = null;

      el.classList.remove("typing");
    }
  }, typingTime);
}

function stopTyping(elementId = "wordDisplay"){
  const el = document.getElementById(elementId);

  // ferma eventuali animazioni precedenti
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;

    el.classList.remove("typing");
  }
}

function nextWord(){

  const current = words[activeTeam]
  current.currentIndex++

  document.querySelectorAll(".word-actions button").forEach(b => b.disabled = false)

  if(current.currentIndex >= current.words.length){
    stopTyping()
    
    document.getElementById("wordDisplay").innerText="FINE"
    current.ended = true
    const btns = document.querySelectorAll("#wordArea button")
    btns.forEach(b => b.disabled = true)
    return
  }

  // document.getElementById("wordDisplay").innerText = current.words[current.currentIndex]
  typeWriter(current.words[current.currentIndex], "wordDisplay", 70)

  saveGame();
}

function markWord(correct){
  stopTyping()

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

//#region RESULTS
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
//#endregion

//#region SALVATAGGI
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
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
  stopTyping()

  localStorage.removeItem(STORAGE_KEY);

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

  const btns = document.querySelectorAll("#wordArea button")
  btns.forEach(b => b.disabled = false)
}
//#endregion