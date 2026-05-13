const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("scene"),
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// LIGHT
scene.add(new THREE.AmbientLight(0xffffff));

// FLOOR
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(12, 0.5, 12),
  new THREE.MeshBasicMaterial({ color: 0x222222 }),
);
floor.position.y = -1;
scene.add(floor);

// =========================
// PORTALS (3 ZONES)
// =========================
const portals = [];

function addPortal(x, z, color, name) {
  const p = new THREE.Mesh(
    new THREE.SphereGeometry(0.7),
    new THREE.MeshBasicMaterial({ color }),
  );

  p.position.set(x, 0, z);
  p.userData.name = name;

  scene.add(p);
  portals.push(p);
}

addPortal(-3, 0, 0x00ff00, "gaming");
addPortal(0, 0, 0x0000ff, "trading");
addPortal(3, 0, 0xff0000, "learning");

camera.position.z = 5;

// =========================
// CLICK SYSTEM (RAYCAST)
// =========================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(portals);

  if (hits.length > 0) {
    const zone = hits[0].object.userData.name;
    enterZone(zone);
  }
});

// =========================
// UI SYSTEM
// =========================
function ui(html) {
  let el = document.getElementById("ui");

  if (!el) {
    el = document.createElement("div");
    el.id = "ui";
    document.body.appendChild(el);
  }

  el.innerHTML = html;
}

function showHubUI() {
  ui(`
    <h2>🌐 Luffy Hub</h2>
    <p>Click a portal or choose a zone below to start your adventure.</p>
    <div class="zone-grid">
      <button data-zone="gaming">🎮 Gaming</button>
      <button data-zone="trading">💰 Trading</button>
      <button data-zone="learning">📚 Learning</button>
    </div>
    <p class="hint">You can also click the colored spheres in the world.</p>
  `);

  document.querySelectorAll("#ui button[data-zone]").forEach((button) => {
    button.onclick = () => enterZone(button.dataset.zone);
  });
}

// =========================
// ZONE CONTROLLER (MAIN BRAIN HOOK)
// =========================
function enterZone(zone) {
  // 👉 CONNECT TO LUFFY AI BRAIN
  if (window.respondToContext) {
    window.respondToContext(zone);
  } else if (window.luffySay) {
    window.luffySay(
      zone === "gaming" ? "happy" : zone === "trading" ? "serious" : "thinking",
    );
  }

  if (zone === "gaming") startGaming();
  if (zone === "trading") startTrading();
  if (zone === "learning") startLearning();
}

// =========================
// GAMING ZONE (REACTION GAME)
// =========================
function startGaming() {
  let ready = false;
  let timer = null;

  ui(`
    <h2>🎮 Reaction Game</h2>
    <p>Wait for the signal, then click as fast as you can.</p>
    <button id="btn">WAIT</button>
    <button id="back">Back to Hub</button>
    <p id="status">Get ready...</p>
  `);

  const btn = document.getElementById("btn");
  const back = document.getElementById("back");
  const status = document.getElementById("status");

  back.onclick = showHubUI;

  timer = setTimeout(() => {
    ready = true;
    btn.innerText = "CLICK!";
    status.innerText = "Now!";
  }, Math.random() * 2500 + 1200);

  btn.onclick = () => {
    if (!ready) {
      status.innerText = "Too early!";
      window.handleGameResult?.("gaming", false);
    } else {
      status.innerText = "Good reflex!";
      window.handleGameResult?.("gaming", true);
    }
    btn.disabled = true;
    clearTimeout(timer);
  };
}

// =========================
// TRADING ZONE (UP/DOWN GAME)
// =========================
function startTrading() {
  const price = Math.floor(Math.random() * 41) + 80;
  const delta = Math.floor(Math.random() * 15) + 5;
  const next = price + (Math.random() > 0.5 ? delta : -delta);

  ui(`
    <h2>💰 Trading Game</h2>
    <p>Current price: <strong>${price}</strong></p>
    <p>Will the next move be up or down?</p>
    <button id="up">UP</button>
    <button id="down">DOWN</button>
    <button id="back">Back to Hub</button>
    <p id="result">Pick your side.</p>
  `);

  const result = document.getElementById("result");
  const upBtn = document.getElementById("up");
  const downBtn = document.getElementById("down");
  const back = document.getElementById("back");

  upBtn.onclick = () => check("up");
  downBtn.onclick = () => check("down");
  back.onclick = showHubUI;

  function check(choice) {
    const correct = next > price ? "up" : "down";
    const direction = next > price ? "higher" : "lower";
    const success = choice === correct;

    result.innerText = success
      ? `Profit ✔ Next price was ${next} (${direction}).`
      : `Loss ✖ Next price was ${next} (${direction}).`;

    upBtn.disabled = true;
    downBtn.disabled = true;
    window.handleGameResult?.("trading", success);
  }
}

// =========================
// LEARNING ZONE (FLASHCARDS)
// =========================
const cards = [
  { q: "BTC stands for?", a: "Bitcoin" },
  { q: "Stop loss?", a: "Limits risk automatically" },
  { q: "Bull market?", a: "Prices going up" },
];

let i = 0;

function startLearning() {
  ui(`
    <h2>📚 Flashcards</h2>
    <div id="card"></div>
    <div class="card-controls">
      <button id="flip">Flip</button>
      <button id="next">Next</button>
    </div>
    <p id="hint">Tap Flip to reveal the answer.</p>
  `);

  const card = document.getElementById("card");
  const hint = document.getElementById("hint");
  const flipBtn = document.getElementById("flip");
  const nextBtn = document.getElementById("next");
  const back = document.createElement("button");

  back.id = "back";
  back.innerText = "Back to Hub";
  document.querySelector(".card-controls").insertAdjacentElement("beforeend", back);

  let flipped = false;

  function updateCard() {
    const entry = cards[i];
    card.innerText = flipped ? entry.a : entry.q;
    hint.innerText = flipped
      ? "Nice job — move to the next card when ready."
      : "Tap Flip to reveal the answer.";
  }

  updateCard();

  flipBtn.onclick = () => {
    flipped = !flipped;
    updateCard();
    if (flipped) window.addXP?.(1);
  };

  nextBtn.onclick = () => {
    i = (i + 1) % cards.length;
    flipped = false;
    updateCard();
  };

  back.onclick = showHubUI;
}

// =========================
// RENDER LOOP
// =========================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

showHubUI();
animate();
