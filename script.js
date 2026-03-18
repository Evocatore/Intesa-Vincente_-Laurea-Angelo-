function openPage(url){
  fireConfetti();

  setTimeout(() => {
    startTransition(url);
  }, 600);
}

function startTransition(url){
  const overlay = document.getElementById("transition-overlay");
  overlay.classList.add("active");

  setTimeout(() => {
    window.location.href = url;
  }, 200); // durata fade
}

function fireConfetti() {
  const duration = 600;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// function fireConfetti() {
//   const duration = 600;
//   const end = Date.now() + duration;

//   (function frame() {
//     confetti({
//       particleCount: 5,
//       angle: 60,
//       spread: 55,
//       origin: { x: 0 }
//     });
//     confetti({
//       particleCount: 5,
//       angle: 120,
//       spread: 55,
//       origin: { x: 1 }
//     });

//     if (Date.now() < end) {
//       requestAnimationFrame(frame);
//     }
//   })();
// }

window.onload = () => {
  setTimeout(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  }, 300);
};

window.addEventListener("DOMContentLoaded", () => {
  const sound = new Audio('./src/opening-sound.mp3');
  sound.volume = 0.5;
  sound.play().catch(e => {
    console.warn("Autoplay bloccato dal browser:", e);
  });
});
