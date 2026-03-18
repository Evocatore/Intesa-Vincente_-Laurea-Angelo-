const STORAGE_KEY = "crucintarsio_save";

const gridData = [
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "@", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "#", "3", "", "", "", ".", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "7", "", "", "", "", ".", "", "", "", "", "", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "5", ".", "", "", "", "", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "8", "", ".", "", "", "", "", "", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "_", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "6", "", "", "", "", "", ".", "", "", "", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "/d20", "", "", "", "", ".", "", "", "", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "1", "", "", "", "", "", ".", "", "", "", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "4", "", "", ".", "", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "10", "", "", "", "", "", "", "", "", ".", "", "", "#", "#", "#", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "#", "9", "", "", "", ".", "", "", "", "", "", "", "", ""],
];

const grid = document.getElementById("grid");
const cellMap = [];

gridData.forEach((row, r) => {
  row.forEach((cell, c) => {
    const input = document.createElement("input");
    input.dataset.row = r;
    input.dataset.col = c;

    if (!cellMap[r]) cellMap[r] = [];
    cellMap[r][c] = input;

    if (cell === "#") {
      input.classList.add("cell", "block");
      input.disabled = true;
    } else if (cell === "" || cell === ".") {
      input.classList.add("cell");

      input.dataset.prev = "";
      input.setAttribute("inputmode", "text");
      input.setAttribute("autocomplete", "off");
      input.setAttribute("autocorrect", "off");
      input.setAttribute("spellcheck", "false");

      if (cell === ".")
      {
      input.classList.add("highlight");
      }
      input.maxLength = 1;

      // navigazione automatica
      // input.addEventListener("input", () => {
      // console.log(r, c);

      //   input.value = input.value.toUpperCase();

      //   if (input.value) {
      //     const next = getNextCell(r, c);
      //     if (next) next.focus();
      //   }
      // });
      input.addEventListener("keydown", (e) => {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);

        // FRECCE
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(r, c, 0, 1);
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(r, c, 0, -1);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          move(r, c, 1, 0);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          move(r, c, -1, 0);
          return;
        }

        // BACKSPACE intelligente
        if (e.key === "Backspace") {
          if (input.value === "") {
            e.preventDefault();
            move(r, c, 0, -1);

            setTimeout(() => {
              const prev = document.activeElement;
              if (prev) {
                prev.value = "";
                saveState();
              }
            }, 0);
          } else {
            input.value = "";
            saveState();
          }
          return;
        }

        // SOLO LETTERE
        if (/^[a-zA-Z]$/.test(e.key)) {
          e.preventDefault();

          // sovrascrive sempre
          input.value = e.key.toUpperCase();
          saveState();
          move(r, c, 0, 1);
        }
      });

      // per mobile
      // input.addEventListener("input", (e) => {
      //   const r = parseInt(input.dataset.row);
      //   const c = parseInt(input.dataset.col);

      //   // Trasforma in maiuscolo
      //   input.value = input.value.toUpperCase();

      //   if (/^[a-zA-Z]$/.test(e.key)) {
      //     e.preventDefault();

      //     // sovrascrive sempre
      //     input.value = e.key.toUpperCase();
      //     saveState();
      //     move(r, c, 0, 1);
      //   }
      // });
      // input.addEventListener("input", () => {
      //   saveState();
      // });

      input.addEventListener("input", (e) => {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);

        const prev = input.dataset.prev;
        let curr = input.value;

        // forza una sola lettera maiuscola
        if (curr.length > 1) {
          curr = curr.slice(-1);
        }

        curr = curr.toUpperCase();
        input.value = curr;

        // 🔙 BACKSPACE (cancellazione)
        if (curr === "" && prev !== "") {
          // ha cancellato contenuto nella cella
          saveState();
          return;
        }

        // 🔙 BACKSPACE su cella vuota → vai indietro
        if (curr === "" && prev === "") {
          move(r, c, 0, -1);

          setTimeout(() => {
            const prevCell = document.activeElement;
            if (prevCell) {
              prevCell.value = "";
              prevCell.dataset.prev = "";
              saveState();
            }
          }, 0);

          return;
        }

        // 🔤 INSERIMENTO NORMALE
        if (curr !== "") {
          saveState();
          move(r, c, 0, 1);
        }

        // aggiorna stato precedente
        input.dataset.prev = input.value;
      });

    } else {
      input.classList.add("cell");
      input.classList.add("special");
      input.disabled = true;

      if (cell.startsWith("/")) {
        let img = cell.split("/")[1];
        input.style.backgroundImage = `url('../src/${img}.png')`;
        input.style.backgroundSize = "contain";
        input.style.backgroundRepeat = "no-repeat";
        input.style.backgroundPosition = "center";
        input.style.backgroundColor = "rgba(0,0,0,0)";
        input.style.border = "none";
      }
      else {
        // input.placeholder = cell;
        input.value = cell;
      }
    }

    grid.appendChild(input);
  });
});

loadState();

//#region MOVE
function getNextCell(r, c) {
  const cols = gridData[0].length;

  let nextC = c + 1;
  let nextR = r;

  while (nextR < gridData.length) {
    while (nextC < cols) {
      if (gridData[nextR][nextC] === "" || gridData[nextR][nextC] === ".") {
        return cellMap[nextR][nextC];
      }
      nextC++;
    }
    nextR++;
    nextC = 0;
  }

  return null;
}

function isEditable(r, c) {
  return (
    gridData[r] &&
    (gridData[r][c] === "" || gridData[r][c] === ".")
  );
}

function move(r, c, dr, dc) {
  let newR = r;
  let newC = c;

  while (true) {
    newR += dr;
    newC += dc;

    if (dc === 1 && newC >= gridData[0].length) {
      newC = 0;
      newR++;
    }

    if (dc === -1 && newC < 0) {
      newC = gridData[0].length - 1;
      newR--;
    }

    if (newR < 0 || newR >= gridData.length) return;

    if (isEditable(newR, newC)) {
      cellMap[newR][newC].focus();
      return;
    }
  }
}
//#endregion

//#region SALVATAGGIO
function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const data = JSON.parse(saved);

  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      if (isEditable(r, c) && data[r][c]) {
        cellMap[r][c].value = data[r][c];
      }
    }
  }
}

function saveState() {
  const data = [];

  for (let r = 0; r < gridData.length; r++) {
    data[r] = [];
    for (let c = 0; c < gridData[r].length; c++) {
      if (isEditable(r, c)) {
        data[r][c] = cellMap[r][c].value || "";
      } else {
        data[r][c] = null;
      }
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetGrid() {
  for (let r = 0; r < gridData.length; r++) {
    for (let c = 0; c < gridData[r].length; c++) {
      if (isEditable(r, c)) {
        cellMap[r][c].value = "";
      }
    }
  }

  localStorage.removeItem(STORAGE_KEY);
}
//#endregion


//#region SUONI
// window.addEventListener("DOMContentLoaded", () => {
//   const loopSound = new Audio('../src/gameplay-crucintarsio.mp3');
//   loopSound.loop = true;
//   loopSound.volume = 0.5;
//   loopSound.play().catch(e => {
//     console.warn("Autoplay bloccato dal browser:", e);
//   });

//   window.addEventListener("beforeunload", () => {
//     loopSound.pause();
//     loopSound.currentTime = 0;
//   });
// });

const loopSound = new Audio('../src/gameplay-crucintarsio.mp3');
loopSound.loop = true;
loopSound.volume = 0.5;

const audioBtn = document.getElementById('startAudio');
let isPlaying = false;


function unlockAudio() {
  loopSound.play().then(() => {
    loopSound.pause();
    loopSound.currentTime = 0;
  }).catch(() => {});
}

document.addEventListener("touchstart", unlockAudio, { once: true });
// document.addEventListener("click", unlockAudio, { once: true });

// audioBtn.addEventListener('click', () => {
//   if(!isPlaying){
//     loopSound.play().catch(e => console.warn("Autoplay bloccato:", e));
//     audioBtn.textContent = '⏸ Musica'; // cambia simbolo in pausa
//     isPlaying = true;
//   } else {
//     loopSound.pause();
//     audioBtn.textContent = '▶ Musica'; // cambia simbolo in play
//     isPlaying = false;
//   }
// });

audioBtn.addEventListener('click', () => {
  if (!isPlaying) {
    loopSound.play().then(() => {
      audioBtn.textContent = '⏸ Musica';
      isPlaying = true;
    }).catch(e => {
      console.warn("Play fallito:", e);
    });
  } else {
    loopSound.pause();
    audioBtn.textContent = '▶ Musica';
    isPlaying = false;
  }
});

// Ferma audio quando si lascia la pagina
window.addEventListener("beforeunload", () => {
  loopSound.pause();
  loopSound.currentTime = 0;
});
//#endregion