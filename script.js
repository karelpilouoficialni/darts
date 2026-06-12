const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;
const CX = W / 2;
const CY = H / 2;
const R = Math.min(W, H) / 2 * 0.85;

const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const SEG_COUNT = 20;
const SEG_ANGLE = (2 * Math.PI) / SEG_COUNT;

const RI = {
    innerBull: 0.04,
    outerBull: 0.10,
    tripleInner: 0.58,
    tripleOuter: 0.63,
    doubleInner: 0.95,
    doubleOuter: 1.00,
};

const state = { hits: [] };

function drawRing(cx, cy, r1, r2, a1, a2, color) {
    ctx.beginPath();
    ctx.arc(cx, cy, r2, a1, a2);
    ctx.arc(cx, cy, r1, a2, a1, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawBoard() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < SEG_COUNT; i++) {
        const a1 = -Math.PI / 2 + i * SEG_ANGLE - SEG_ANGLE / 2;
        const a2 = a1 + SEG_ANGLE;
        const even = i % 2 === 0;
        const base = even ? '#1a1a1a' : '#f5e6d3';
        const ring = even ? '#e74c3c' : '#27ae60';

        drawRing(CX, CY, R * RI.outerBull, R * RI.tripleInner, a1, a2, base);
        drawRing(CX, CY, R * RI.tripleInner, R * RI.tripleOuter, a1, a2, ring);
        drawRing(CX, CY, R * RI.tripleOuter, R * RI.doubleInner, a1, a2, base);
        drawRing(CX, CY, R * RI.doubleInner, R * RI.doubleOuter, a1, a2, ring);
    }

    ctx.beginPath();
    ctx.arc(CX, CY, R * RI.outerBull, 0, 2 * Math.PI);
    ctx.fillStyle = '#27ae60';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CX, CY, R * RI.innerBull, 0, 2 * Math.PI);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    const circles = [RI.innerBull, RI.outerBull, RI.tripleInner, RI.tripleOuter, RI.doubleInner, RI.doubleOuter];
    for (const r of circles) {
        ctx.beginPath();
        ctx.arc(CX, CY, R * r, 0, 2 * Math.PI);
        ctx.stroke();
    }

    for (let i = 0; i < SEG_COUNT; i++) {
        const angle = -Math.PI / 2 + i * SEG_ANGLE - SEG_ANGLE / 2;
        ctx.beginPath();
        ctx.moveTo(CX + R * RI.outerBull * Math.cos(angle), CY + R * RI.outerBull * Math.sin(angle));
        ctx.lineTo(CX + R * RI.doubleOuter * Math.cos(angle), CY + R * RI.doubleOuter * Math.sin(angle));
        ctx.stroke();
    }

    const numR = R * 1.10;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < SEG_COUNT; i++) {
        const angle = -Math.PI / 2 + i * SEG_ANGLE;
        const nx = CX + numR * Math.cos(angle);
        const ny = CY + numR * Math.sin(angle);
        ctx.fillText(NUMBERS[i], nx, ny);
    }
}

function getScore(x, y) {
    const dx = x - CX;
    const dy = y - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const r = dist / R;

    if (dist > R * RI.doubleOuter + 5) return null;

    if (r < RI.innerBull) return { score: 50, label: 'Bullseye (50)' };
    if (r < RI.outerBull) return { score: 25, label: 'Outer bull (25)' };

    let angle = Math.atan2(dy, dx);
    let a = angle + Math.PI / 2;
    if (a < 0) a += 2 * Math.PI;
    const idx = Math.floor(((a + SEG_ANGLE / 2) % (2 * Math.PI)) / SEG_ANGLE);
    const num = NUMBERS[idx];

    if (r < RI.tripleInner) return { score: num, label: num.toString() };
    if (r < RI.tripleOuter) return { score: num * 3, label: 'Triple ' + num + ' (' + (num * 3) + ')' };
    if (r < RI.doubleInner) return { score: num, label: num.toString() };
    return { score: num * 2, label: 'Double ' + num + ' (' + (num * 2) + ')' };
}

function drawMarker(x, y, label, isLast, index) {
    if (isLast) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 14);
        grad.addColorStop(0, 'rgba(231, 76, 60, 0.5)');
        grad.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, isLast ? 5 : 3.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isLast && label) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(label, x, y - 12);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(index.toString(), x, y);
}

function render() {
    drawBoard();
    const len = state.hits.length;
    for (let i = 0; i < len; i++) {
        const h = state.hits[i];
        drawMarker(h.x, h.y, h.label, i === len - 1, i + 1);
    }
}

function updateUI() {
    const total = state.hits.reduce((s, h) => s + h.score, 0);
    const count = state.hits.length;
    const last = count > 0 ? state.hits[count - 1].label : '-';

    document.getElementById('totalScore').textContent = total;
    document.getElementById('dartCount').textContent = count;
    document.getElementById('lastScore').textContent = last;
    document.getElementById('undoBtn').disabled = count === 0;

    const el = document.getElementById('history');
    el.innerHTML = '';
    if (count === 0) {
        el.innerHTML = '<div class="history-empty">No throws yet</div>';
    } else {
        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = '<span>' + (i + 1) + '.</span><span>' + state.hits[i].label + '</span><span class="h-score">' + state.hits[i].score + '</span>';
            el.appendChild(div);
        }
        el.scrollTop = el.scrollHeight;
    }
}

canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const result = getScore(x, y);
    if (!result) return;

    state.hits.push({ x, y, score: result.score, label: result.label });

    document.getElementById('selectedScore').textContent = result.label;
    document.getElementById('selectedScore').style.color = '#2ecc71';
    setTimeout(function () {
        const el = document.getElementById('selectedScore');
        if (el) el.style.color = '#f1c40f';
    }, 600);

    updateUI();
    render();
});

document.getElementById('undoBtn').addEventListener('click', function () {
    if (state.hits.length === 0) return;
    state.hits.pop();
    const lastLabel = state.hits.length > 0
        ? state.hits[state.hits.length - 1].label
        : 'Click the dartboard';
    document.getElementById('selectedScore').textContent = lastLabel;
    document.getElementById('selectedScore').style.color = '#f1c40f';
    updateUI();
    render();
});

document.getElementById('resetBtn').addEventListener('click', function () {
    if (state.hits.length === 0) return;
    state.hits = [];
    document.getElementById('selectedScore').textContent = 'Click the dartboard';
    document.getElementById('selectedScore').style.color = '#f1c40f';
    updateUI();
    render();
});

render();
updateUI();
