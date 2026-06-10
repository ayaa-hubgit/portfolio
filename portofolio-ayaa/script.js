// ─── 1. CUSTOM CURSOR ────────────────────────────────────────────────────────
const cursorRing = document.querySelector(".custom-cursor");
const cursorDot = document.querySelector(".custom-cursor-dot");

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateCursor);
}
animateCursor();

// ─── 2. MOUSE GLOW ────────────────────────────────────────────────────────────
const glow = document.querySelector(".mouse-glow");
let glowX = 0, glowY = 0;
let currentGlowX = 0, currentGlowY = 0;

document.addEventListener("mousemove", (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
    targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

function animateGlow() {
    currentGlowX += (glowX - currentGlowX) * 0.06;
    currentGlowY += (glowY - currentGlowY) * 0.06;
    glow.style.left = currentGlowX + "px";
    glow.style.top = currentGlowY + "px";
    requestAnimationFrame(animateGlow);
}
animateGlow();

// ─── 3. CANVAS: FLOATING HEARTS & STARS ──────────────────────────────────────
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let targetMouseX = 0, targetMouseY = 0;
let customMouseX = 0, customMouseY = 0;

const elements = [];
const bursts = [];
const meteors = [];
const numElements = 70;

const chars = ["♥", "★", "✧", "✦", "·", "🌸"];

for (let i = 0; i < numElements; i++) {
    elements.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.3 + 0.15,
        speed: Math.random() * 0.18 + 0.04,
        char: chars[Math.floor(Math.random() * chars.length)],
        size: Math.random() * 4 + 8,
    });
}

// Click sparkle burst
window.addEventListener("click", (e) => {
    const tag = e.target.tagName;
    if (tag === "BUTTON" || tag === "A" || tag === "INPUT" || tag === "TEXTAREA") return;

    for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14;
        const speed = Math.random() * 3.5 + 1.5;
        bursts.push({
            x: e.clientX, y: e.clientY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 2.5 + 1,
            alpha: 1,
            color: ["#f43f5e", "#fb7185", "#fda4af", "#ffe4e6"][Math.floor(Math.random() * 4)]
        });
    }
});

// Meteor / shooting star
function createMeteor() {
    if (meteors.length < 2 && Math.random() < 0.0025) {
        meteors.push({
            x: Math.random() * canvas.width * 0.6,
            y: -10,
            length: Math.random() * 70 + 35,
            speedX: Math.random() * 3 + 2.5,
            speedY: Math.random() * 3 + 2.5,
            alpha: 1
        });
    }
}

function animateElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    customMouseX += (targetMouseX - customMouseX) * 0.04;
    customMouseY += (targetMouseY - customMouseY) * 0.04;

    // Floating elements
    elements.forEach(item => {
        const finalX = item.x - customMouseX * 12 * item.z;
        const finalY = item.y - customMouseY * 12 * item.z;

        item.alpha += (Math.random() - 0.5) * 0.025;
        item.alpha = Math.min(0.55, Math.max(0.1, item.alpha));

        ctx.font = `${item.size * item.z}px Arial`;
        ctx.fillStyle = `rgba(251, 113, 133, ${item.alpha})`;
        ctx.fillText(item.char, finalX, finalY);

        item.y += item.speed;
        if (item.y > canvas.height + 20) {
            item.y = -10;
            item.x = Math.random() * canvas.width;
        }
    });

    // Click burst particles
    for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gentle gravity
        p.alpha -= 0.022;
        if (p.alpha <= 0) { bursts.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Shooting stars
    createMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.speedX;
        m.y += m.speedY;
        m.alpha -= 0.018;
        if (m.alpha <= 0 || m.y > canvas.height || m.x > canvas.width) {
            meteors.splice(i, 1); continue;
        }

        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.length, m.y - m.length);
        grad.addColorStop(0, `rgba(244,63,94,${m.alpha})`);
        grad.addColorStop(0.5, `rgba(251,113,133,${m.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(244,63,94,0)');

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.length, m.y - m.length);
        ctx.stroke();
    }

    requestAnimationFrame(animateElements);
}
animateElements();

// ─── 4. TYPING EFFECT ─────────────────────────────────────────────────────────
const title = document.getElementById("heroTitle");
const text = "Aya.";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        title.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 180 + Math.random() * 60); // slight randomness = human feel
    } else {
        title.classList.add("typing-done");
    }
}
typeWriter();

// ─── 5. SMOOTH SCROLL BUTTON ──────────────────────────────────────────────────
document.getElementById("projectBtn").addEventListener("click", () => {
    document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
});

// ─── 6. INTERSECTION OBSERVER (FADE IN + SKILL BARS) ─────────────────────────
const sections = document.querySelectorAll(".fade-in");
const skillBarsTriggered = new Set();

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");

            // Animate skill bars when skills section enters
            if (entry.target.classList.contains("skills") && !skillBarsTriggered.has(entry.target)) {
                skillBarsTriggered.add(entry.target);
                setTimeout(() => {
                    document.querySelectorAll(".skill-bar-fill").forEach(bar => {
                        const w = bar.getAttribute("data-width");
                        bar.style.width = w + "%";
                    });
                }, 300);
            }
        }
    });
}, { threshold: 0.12 });

sections.forEach(section => observer.observe(section));

// ─── 7. NAVBAR ACTIVE LINK ────────────────────────────────────────────────────
const navLinks = document.querySelectorAll("nav a");
const allSections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
    let current = "";
    allSections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 260) {
            current = section.getAttribute("id");
        }
    });
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active");
    });
});

// ─── 8. 3D TILT CARDS ─────────────────────────────────────────────────────────
const tiltCards = document.querySelectorAll(".tilt-card");

tiltCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rX = ((cy - y) / cy) * 9;
        const rY = ((x - cx) / cx) * 9;

        card.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-6px) scale(1.01)`;
        card.style.boxShadow = `${-rY * 1.5}px ${rX * 1.5}px 30px rgba(244,63,94,0.18)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`;
        card.style.boxShadow = "";
    });
});

// ─── 9. HERO 3D PARALLAX (lightweight) ───────────────────────────────────────
const shapes = document.querySelectorAll(".float-shape");

document.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    shapes.forEach((shape, i) => {
        const depth = (i + 1) * 8;
        shape.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
});

// ─── 10. CONTACT FORM ─────────────────────────────────────────────────────────
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending love... 💞";
        submitBtn.style.opacity = "0.7";
        submitBtn.disabled = true;

        const data = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: contactForm.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = "Pesan terkirim! Terima kasih sudah menghubungi Aya 🌸";
                formStatus.className = "form-status success";
                contactForm.reset();
            } else {
                formStatus.textContent = "Oops! Ada masalah saat mengirim pesan. 😢";
                formStatus.className = "form-status error";
            }
        } catch {
            formStatus.textContent = "Gagal terhubung ke server. Cek koneksi kamu ya! 💕";
            formStatus.className = "form-status error";
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
            setTimeout(() => { formStatus.textContent = ""; }, 5000);
        }
    });
}
