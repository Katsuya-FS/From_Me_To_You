const CONFIG = {
  personName: "Cyrone", // {personName}: who sent the gift (modal + signature)
  recipient: "Riena", // who the letter is addressed to
  message: `To make your day an extra little special

I wish that the world would be more kinder to you and that you would be treated with the respect and love that you deserve.
You are always appreciated and seen as long as I'm around. I will be always be proud of you no matter what!

As always, I will be forever by your side at all times in all ways!`,
  signoff: "Yours,",
};
// Optional override by URL: ?from=Alex&to=Jamie&msg=Your+message
const q = new URLSearchParams(location.search);
if (q.get("from")) CONFIG.personName = q.get("from");
if (q.get("to")) CONFIG.recipient = q.get("to");
if (q.get("msg")) CONFIG.message = q.get("msg");
/* ======================================================= */

const $ = (id) => document.getElementById(id);
$("who").textContent = CONFIG.personName;
const audio = new Audio("assets/audio/videoplayback.m4a");
audio.addEventListener("ended", () => {
  audio.currentTime = 123;
  audio.play().catch(() => {});
});

/* ---------- Pixelated city + looping fireworks ---------- */
const cv = $("bg"),
  ctx = cv.getContext("2d");
const PX = 4; // one "pixel" = 4 screen px
let W,
  H,
  buildings = [],
  stars = [],
  rockets = [],
  sparks = [];
const SKY = [
  "#0c0626",
  "#120a2e",
  "#190d38",
  "#210f42",
  "#2c1150",
  "#3a135a",
  "#4c1565",
  "#611870",
  "#7b1c78",
  "#96237f",
];
const FW = [
  "#ff5fa2",
  "#ffd1e6",
  "#ffe14d",
  "#7df9ff",
  "#ff8a5c",
  "#c9a0ff",
  "#ffffff",
];
const rnd = (a, b) => a + Math.random() * (b - a);

function build() {
  W = Math.ceil(innerWidth / PX);
  H = Math.ceil(innerHeight / PX);
  cv.width = W;
  cv.height = H;
  stars = Array.from({ length: ((W * H) / 260) | 0 }, () => ({
    x: rnd(0, W) | 0,
    y: rnd(0, H * 0.55) | 0,
    t: rnd(0, 6),
  }));
  buildings = [];
  let x = 0;
  while (x < W) {
    const w = rnd(8, 18) | 0,
      h = rnd(H * 0.12, H * 0.38) | 0,
      wins = [];
    for (let wx = x + 2; wx < x + w - 2; wx += 3)
      for (let wy = H - h + 3; wy < H - 2; wy += 4)
        wins.push({ x: wx, y: wy, on: Math.random() < 0.55 });
    buildings.push({
      x,
      w,
      h,
      wins,
      shade: Math.random() < 0.5 ? "#0a0618" : "#140a2a",
    });
    x += w + (Math.random() < 0.3 ? 1 : 0);
  }
}

function launch() {
  rockets.push({
    x: rnd(W * 0.1, W * 0.9),
    y: H - 6,
    ty: rnd(H * 0.12, H * 0.45),
    c: FW[rnd(0, FW.length) | 0],
  });
}
function explode(r) {
  const n = rnd(36, 60) | 0,
    c2 = FW[rnd(0, FW.length) | 0],
    sp = rnd(0.6, 1.3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    sparks.push({
      x: r.x,
      y: r.y,
      vx: Math.cos(a) * sp * rnd(0.7, 1),
      vy: Math.sin(a) * sp * rnd(0.7, 1),
      life: rnd(45, 70),
      c: i % 3 ? r.c : c2,
    });
  }
}

let last = 0,
  nextLaunch = 0;
function frame(t) {
  if (t - last > 33) {
    // ~30 fps for a chunkier retro feel
    last = t;
    SKY.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, ((i * H) / SKY.length) | 0, W, Math.ceil(H / SKY.length));
    });
    stars.forEach((s) => {
      s.t += 0.05;
      if (Math.sin(s.t) > -0.3) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(s.x, s.y, 1, 1);
      }
    });

    if (t > nextLaunch) {
      launch();
      if (Math.random() < 0.4) launch();
      nextLaunch = t + rnd(500, 1300);
    }

    rockets = rockets.filter((r) => {
      r.y -= 1.6;
      ctx.fillStyle = r.c;
      ctx.fillRect(r.x | 0, r.y | 0, 1, 2);
      ctx.fillStyle = "#ffffff55";
      ctx.fillRect(r.x | 0, (r.y + 3) | 0, 1, 2);
      if (r.y <= r.ty) {
        explode(r);
        return false;
      }
      return true;
    });
    sparks = sparks.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.018;
      p.vx *= 0.985;
      p.life--;
      ctx.globalAlpha = Math.min(1, p.life / 25);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
      ctx.globalAlpha = 1;
      return p.life > 0;
    });

    buildings.forEach((b) => {
      ctx.fillStyle = b.shade;
      ctx.fillRect(b.x, H - b.h, b.w, b.h);
      b.wins.forEach((w) => {
        if (Math.random() < 0.002) w.on = !w.on;
        if (w.on) {
          ctx.fillStyle = Math.random() < 0.002 ? "#ffffff" : "#ffd36b";
          ctx.fillRect(w.x, w.y, 1, 2);
        }
      });
    });
  }
  requestAnimationFrame(frame);
}
build();
addEventListener("resize", build);
requestAnimationFrame(frame);

/* ---------- Pixel-art pink bouquet ---------- */
(function drawBouquet() {
  const c = $("bouquet").getContext("2d");
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const stem = (x1, y1, x2, y2) => {
    const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= n; i++)
      px(
        Math.round(x1 + ((x2 - x1) * i) / n),
        Math.round(y1 + ((y2 - y1) * i) / n),
        1,
        1,
        "#2f9e5b",
      );
  };
  const flower = (cx, cy, r, main, dark, mid) => {
    for (let dy = -r - 1; dy <= r + 1; dy++)
      for (let dx = -r - 1; dx <= r + 1; dx++) {
        const a = Math.atan2(dy, dx),
          rr = r + (Math.cos(a * 5) > 0.55 ? 1 : 0),
          d = Math.hypot(dx, dy);
        if (d <= rr)
          px(
            cx + dx,
            cy + dy,
            1,
            1,
            d > rr - 1 ? dark : d < r * 0.45 ? mid : main,
          );
      }
    px(cx, cy, 1, 1, "#ffe14d");
  };
  const leaf = (x, y, dir) => {
    px(x, y, 3 * dir, 1, "#2f9e5b");
    px(x + dir, y - 1, 2 * dir, 1, "#43c477");
  };

  const heads = [
    [24, 10, 7],
    [12, 20, 6],
    [36, 20, 6],
    [19, 29, 5],
    [30, 29, 5],
  ];
  heads.forEach(([x, y]) => stem(x, y, 24, 46));
  leaf(14, 38, -1);
  leaf(34, 38, 1);
  leaf(16, 42, -1);
  leaf(32, 43, 1);
  flower(12, 20, 6, "#ff7fb5", "#d6246e", "#ffc2dc");
  flower(36, 20, 6, "#ff7fb5", "#d6246e", "#ffc2dc");
  flower(24, 10, 7, "#ff5fa2", "#c01a62", "#ffb3d3");
  flower(19, 29, 5, "#ffa0c8", "#e0397f", "#ffe0ee");
  flower(30, 29, 5, "#ff5fa2", "#c01a62", "#ffb3d3");

  // wrapping paper (triangle) + ribbon
  for (let y = 36; y < 62; y++) {
    const half = Math.round(14 - (y - 36) * 0.5);
    px(24 - half, y, half * 2 + 1, 1, y % 2 ? "#ffe3ee" : "#ffd1e6");
    px(24 - half, y, 1, 1, "#3a1030");
    px(24 + half, y, 1, 1, "#3a1030");
  }
  px(10, 36, 29, 1, "#3a1030");
  px(24 - 5, 61, 11, 1, "#3a1030");
  px(18, 44, 13, 3, "#d6246e"); // ribbon band
  px(14, 41, 5, 4, "#ff5fa2");
  px(30, 41, 5, 4, "#ff5fa2");
  px(22, 42, 5, 4, "#c01a62"); // bow
})();

/* ---------- Accept -> letter ---------- */
$("acceptBtn").addEventListener("click", () => {
  audio.currentTime = 123;
  audio.play().catch(() => {});
  $("modal").classList.add("hidden");
  $("scene").classList.remove("hidden");
  $("to").textContent = "Dear " + CONFIG.recipient + ",";
  $("sig").textContent = CONFIG.signoff + "\n" + CONFIG.personName;
  $("sig").style.whiteSpace = "pre-line";
  const el = $("msg"),
    text = CONFIG.message;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
    el.textContent = text;
    return;
  }
  let i = 0; // typewriter effect
  (function type() {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(type, 28);
  })();
});

const bgm = $("bgm");
const START = 2 * 60 + 10; // 2:10

function playMusic() {
  const seekThenPlay = () => {
    bgm.addEventListener("seeked", () => bgm.play().catch(() => {}), {
      once: true,
    });
    bgm.currentTime = START;
  };
  bgm.readyState >= 3
    ? seekThenPlay()
    : bgm.addEventListener("canplay", seekThenPlay, { once: true });
  bgm.load(); // starts buffering if the file hasn't loaded yet
}

bgm.addEventListener("ended", () => {
  bgm.currentTime = START;
  bgm.play();
}); // loop back to 2:10
