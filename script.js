const OTN = "Genesi,Esodo,Levitico,Numeri,Deuteronomio,Giosuè,Giudici,Rut,1 Samuele,2 Samuele,1 Re,2 Re,1 Cronache,2 Cronache,Esdra,Neemia,Ester,Giobbe,Salmi,Proverbi,Ecclesiaste,Cantico,Isaia,Geremia,Lamentazioni,Ezechiele,Daniele,Osea,Gioele,Amos,Abdia,Giona,Michea,Naum,Abacuc,Sofonia,Aggeo,Zaccaria,Malachia".split(",");
const OTA = "Gen,Es,Lv,Nm,Dt,Gs,Gdc,Rt,1Sam,2Sam,1Re,2Re,1Cr,2Cr,Esd,Ne,Est,Gb,Sal,Pr,Qo,Ct,Is,Ger,Lam,Ez,Dn,Os,Gl,Am,Abd,Gio,Mic,Na,Ab,Sof,Ag,Zc,Ml".split(",");
const OTC = [50, 40, 27, 36, 34, 24, 21, 4, 31, 24, 22, 25, 29, 36, 10, 13, 10, 42, 150, 31, 12, 8, 66, 52, 5, 48, 12, 14, 3, 9, 1, 4, 7, 3, 3, 3, 2, 14, 4];
const NTN = "Matteo,Marco,Luca,Giovanni,Atti,Romani,1 Corinzi,2 Corinzi,Galati,Efesini,Filippesi,Colossesi,1 Tessalonicesi,2 Tessalonicesi,1 Timoteo,2 Timoteo,Tito,Filemone,Ebrei,Giacomo,1 Pietro,2 Pietro,1 Giovanni,2 Giovanni,3 Giovanni,Giuda,Apocalisse".split(",");
const NTA = "Mt,Mc,Lc,Gv,At,Rm,1Cor,2Cor,Gal,Ef,Fil,Col,1Ts,2Ts,1Tm,2Tm,Tt,Fm,Eb,Gc,1Pt,2Pt,1Gv,2Gv,3Gv,Gd,Ap".split(",");
const NTC = [28, 16, 24, 21, 28, 16, 16, 13, 6, 6, 4, 4, 5, 3, 6, 4, 3, 1, 13, 5, 5, 3, 5, 1, 1, 1, 22];
const BK = [], CH = []; let TOT = 0;
[[OTN, OTA, OTC, 0], [NTN, NTA, NTC, 1]].forEach(([N, A, C, t]) => N.forEach((n, i) => { const b = { n, a: A[i], c: C[i], s: TOT, t }; BK.push(b); for (let c = 1; c <= b.c; c++)CH.push({ b: BK.length - 1, n: c }); TOT += b.c }));
const OT_END = 929, GS = BK[39].s, GE = BK[43].s;

let D;

fetch("./data.bin")
    .then(r => r.arrayBuffer())
    .then(buf => {
        D = new Uint16Array(buf);
        const M = D.length / 4;
        const FL = new Uint8Array(M), BU = new Uint8Array(M);
        for (let i = 0; i < M; i++) {
            const a = D[4 * i], b = D[4 * i + 1], oa = a < OT_END, ob = b < OT_END, g = x => x >= GS && x < GE;
            FL[i] = (oa !== ob ? 1 : 0) | (((oa && g(b)) || (ob && g(a))) ? 2 : 0); BU[i] = Math.min(11, Math.floor(12 * Math.pow((b - a) / TOT, .6)))
        }
        const cv = document.getElementById("cv"), ctx = cv.getContext("2d"), wrap = document.getElementById("wrap"), tip = document.getElementById("tip"), info = document.getElementById("info");
        const root = document.documentElement;
        let W = 0, H = 0, AY = 0, pw = 0, dpr = 1, k = 1, tx = 0, scope = 0, minV = 20, sel = [], selB = [], hov = null, hset = null, drag = null, mp = null, raf = 0, dirty = true, hKey = "", pin = null;
        const css = n => getComputedStyle(root).getPropertyValue(n).trim();
        const isDark = () => root.dataset.theme === "dark" || (root.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
        const col = b => `hsl(${235 - 215 * b / 11} 70% ${isDark() ? 64 : 42}%)`;
        const X = i => tx + (i + .5) * pw;
        const RY = (a, b) => Math.max(10, (AY - 34) * Math.pow((b - a) / TOT, .75));
        const nm = i => BK[CH[i].b].n + " " + CH[i].n;
        function ap(i) {
            const a = D[4 * i], b = D[4 * i + 1], x1 = X(a), x2 = X(b); if (x2 < -20 || x1 > W + 20) return false;
            const c = RY(a, b) * 4 / 3; ctx.moveTo(x1, AY); ctx.bezierCurveTo(x1, AY - c, x2, AY - c, x2, AY); return true
        }
        function refilter() {
            selB = Array.from({ length: 12 }, () => []);
            for (let i = 0; i < M; i++) { if (D[4 * i + 2] < minV) continue; if (scope && !(FL[i] & scope)) continue; selB[BU[i]].push(i) }
            sel = [].concat(...selB); if (pin !== null && !(D[4 * pin + 2] >= minV && (!scope || (FL[pin] & scope)))) pin = null; hov = null; hset = null; hKey = ""; tip.hidden = true; dirty = true; sched();
        }
        function layout() {
            W = wrap.clientWidth; H = wrap.clientHeight; AY = H - 96; dpr = window.devicePixelRatio || 1;
            cv.width = W * dpr; cv.height = H * dpr; dirty = true; sched();
        }
        function draw() {
            pw = W * k / TOT; tx = Math.min(0, Math.max(W - W * k, tx));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineCap = "round";
            const n = sel.length, al = n < 1500 ? .55 : n < 6000 ? .3 : n < 20000 ? .16 : .08;
            ctx.lineWidth = 1; ctx.globalAlpha = (hset || pin !== null) ? .035 : al;
            for (let b = 0; b < 12; b++) { ctx.beginPath(); for (const i of selB[b]) ap(i); ctx.strokeStyle = col(b); ctx.stroke() }
            if (hset) {
                ctx.globalAlpha = .9; ctx.lineWidth = hov.kind === "a" ? 3.5 : 1.5;
                for (const i of hset) {
                    ctx.beginPath(); if (ap(i)) {
                        ctx.strokeStyle = col(BU[i]); ctx.stroke();
                        if (hset.length <= 3000) { ctx.fillStyle = ctx.strokeStyle; for (const x of [D[4 * i], D[4 * i + 1]]) { ctx.beginPath(); ctx.arc(X(x), AY, hov.kind === "a" ? 4.5 : 2.5, 0, 7); ctx.fill() } }
                    }
                }
            }
            if (pin !== null) { ctx.globalAlpha = 1; ctx.lineWidth = 3.5; ctx.beginPath(); if (ap(pin)) { ctx.strokeStyle = col(BU[pin]); ctx.stroke(); ctx.fillStyle = ctx.strokeStyle; for (const x of [D[4 * pin], D[4 * pin + 1]]) { ctx.beginPath(); ctx.arc(X(x), AY, 4.5, 0, 7); ctx.fill() } } }
            ctx.globalAlpha = 1;
            const fg = css("--fg"), mut = css("--mut"), line = css("--line"), card = css("--card"), bkfg = css("--bkfg"), cols = [css("--ot"), css("--ot2"), css("--nt"), css("--nt2")];
            ctx.font = "11px system-ui,sans-serif"; ctx.textAlign = "center";
            const dv = tx + OT_END * pw; ctx.strokeStyle = mut; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(dv, 10); ctx.lineTo(dv, AY + 52); ctx.stroke(); ctx.setLineDash([]);
            BK.forEach((b, bi) => {
                const x0 = tx + b.s * pw, w = b.c * pw; if (x0 + w < 0 || x0 > W) return;
                ctx.fillStyle = cols[b.t * 2 + bi % 2]; ctx.fillRect(x0 + .5, AY + 4, Math.max(w - 1, .5), 24);
                const v0 = Math.max(0, x0), v1 = Math.min(W, x0 + w), vw = v1 - v0, t = vw >= b.n.length * 6.6 + 8 ? b.n : vw >= b.a.length * 6.6 + 4 ? b.a : "";
                if (t) { ctx.fillStyle = bkfg; ctx.fillText(t, (v0 + v1) / 2, AY + 20) }
            });
            if (pw >= 7) {
                const i0 = Math.max(0, Math.floor(-tx / pw) - 1), i1 = Math.min(TOT - 1, Math.ceil((W - tx) / pw));
                for (let i = i0; i <= i1; i++) {
                    const x = tx + i * pw; ctx.fillStyle = card; ctx.fillRect(x, AY + 30, pw, 20); ctx.strokeStyle = line; ctx.strokeRect(x + .5, AY + 30.5, pw - 1, 19);
                    if (pw >= 15) { ctx.fillStyle = mut; ctx.font = "10px system-ui,sans-serif"; ctx.fillText(CH[i].n, x + pw / 2, AY + 44) }
                }
            }
            if (hov && hov.kind !== "a") {
                ctx.strokeStyle = fg; ctx.lineWidth = 2;
                if (hov.kind === "b") { const b = BK[hov.id]; ctx.strokeRect(tx + b.s * pw, AY + 4, b.c * pw, 24) }
                else ctx.strokeRect(tx + hov.id * pw, AY + 30, Math.max(pw, 2), 20);
            }
            ctx.font = "600 12px system-ui,sans-serif"; ctx.fillStyle = mut;
            [[0, OT_END, "ANTICO TESTAMENTO"], [OT_END, TOT, "NUOVO TESTAMENTO"]].forEach(([a, b, t]) => {
                const x0 = tx + a * pw, x1 = tx + b * pw; if (x1 < 0 || x0 > W) return; ctx.fillText(t, (Math.max(0, x0) + Math.min(W, x1)) / 2, H - 14)
            });
            info.textContent = `${sel.length.toLocaleString("it-IT")} archi · zoom ×${k.toFixed(1)}` + (pin !== null ? ` · Selezionato: ${nm(D[4 * pin])} ↔ ${nm(D[4 * pin + 1])}` : "");
        }
        function sd(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1); t = t < 0 ? 0 : t > 1 ? 1 : t; const x = x1 + t * dx - px, y = y1 + t * dy - py; return x * x + y * y }
        function pickArc(mx, my) {
            let best = null, bd = 49;
            for (const i of sel) {
                const a = D[4 * i], b = D[4 * i + 1], x1 = X(a), x2 = X(b); if (mx < x1 - 7 || mx > x2 + 7) continue;
                const ry = RY(a, b); if (my < AY - ry - 7) continue;
                let px = x1, py = AY;
                for (let s = 1; s <= 16; s++) { const t = s / 16, qx = x1 + (x2 - x1) * (3 * t * t - 2 * t * t * t), qy = AY - 4 * ry * t * (1 - t), d = sd(mx, my, px, py, qx, qy); if (d < bd) { bd = d; best = i } px = qx; py = qy }
            }
            return best === null ? null : { kind: "a", id: best };
        }
        function compute() {
            const { x, y } = mp; let nh = null;
            if (y >= AY + 3 && y <= AY + 52) { const idx = Math.floor((x - tx) / pw); if (idx >= 0 && idx < TOT) nh = (y < AY + 29 || pw < 7) ? { kind: "b", id: CH[idx].b } : { kind: "c", id: idx } }
            else if (y < AY) nh = pickArc(x, y);
            const key = nh ? nh.kind + nh.id : "";
            if (key !== hKey) {
                hKey = key; hov = nh; hset = null; let html = "";
                if (nh) {
                    if (nh.kind === "a") { const i = nh.id; hset = [i]; html = `<b>${nm(D[4 * i])} ↔ ${nm(D[4 * i + 1])}</b><br>Unisce ${D[4 * i + 3]} coppie di versetti dei due capitoli<br>Voti ricevuti dagli utenti: ${D[4 * i + 2]} in totale` }
                    else {
                        const m = nh.kind === "b" ? a => CH[a].b === nh.id : a => a === nh.id; hset = sel.filter(i => m(D[4 * i]) || m(D[4 * i + 1]));
                        html = `<b>${nh.kind === "b" ? BK[nh.id].n : nm(nh.id)}</b><br>${hset.length.toLocaleString("it-IT")} collegamenti con la selezione attuale`; if (!hset.length) hset = null
                    }
                }
                tip.innerHTML = html; tip.hidden = !nh; return true;
            }
            return false;
        }
        function frame() {
            raf = 0; let ch = false;
            if (mp && !(drag && drag.m)) ch = compute();
            if (dirty || ch) draw(); dirty = false;
            if (mp && !tip.hidden) { let x = mp.x + 14, y = mp.y + 14; if (x + tip.offsetWidth > W) x = mp.x - 14 - tip.offsetWidth; if (y + tip.offsetHeight > H) y = mp.y - 14 - tip.offsetHeight; tip.style.left = Math.max(4, x) + "px"; tip.style.top = Math.max(4, y) + "px" }
        }
        function sched() { if (!raf) raf = requestAnimationFrame(frame) }
        const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } };
        function zoomAt(mx, fac) { const nk = Math.min(120, Math.max(1, k * fac)); if (nk === k) return; tx = mx - (mx - tx) * (nk / k); k = nk; hKey = ""; hov = null; hset = null; dirty = true; sched() }
        cv.addEventListener("pointerdown", e => { drag = { x: e.clientX, tx, m: false }; cv.setPointerCapture(e.pointerId); mp = pos(e); sched() });
        cv.addEventListener("pointermove", e => {
            mp = pos(e);
            if (drag) { const dx = e.clientX - drag.x; if (Math.abs(dx) > 3) drag.m = true; if (drag.m) { tx = drag.tx + dx; hKey = ""; hov = null; hset = null; tip.hidden = true; dirty = true } }
            sched();
        });
        const end = () => { drag = null }; cv.addEventListener("pointerup", e => { const d = drag; drag = null; if (d && !d.m) { mp = pos(e); compute(); pin = hov && hov.kind === "a" ? hov.id : null; dirty = true; sched() } }); cv.addEventListener("pointercancel", end);
        cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && !drag) { mp = null; hKey = ""; hov = null; hset = null; tip.hidden = true; dirty = true; sched() } });
        cv.addEventListener("wheel", e => { e.preventDefault(); zoomAt(pos(e).x, Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0018))) }, { passive: false });
        cv.addEventListener("dblclick", e => zoomAt(pos(e).x, 2));
        document.getElementById("zin").onclick = () => zoomAt(W / 2, 1.6);
        document.getElementById("zout").onclick = () => zoomAt(W / 2, 1 / 1.6);
        document.getElementById("zreset").onclick = () => { k = 1; tx = 0; hKey = ""; hov = null; hset = null; dirty = true; sched() };
        const rg = document.getElementById("rg"), vv = document.getElementById("vv");
        rg.oninput = () => { minV = +rg.value; vv.textContent = "almeno " + minV + " voti"; refilter() };
        const sc = document.getElementById("scope");
        [["Tutti i riferimenti", 0], ["Antico ↔ Nuovo Testamento", 1], ["Antico Testamento ↔ Vangeli", 2]].forEach(([l, v]) => {
            const b = document.createElement("button"); b.className = "chip" + (v === scope ? " on" : ""); b.textContent = l;
            b.onclick = () => { scope = v;[...sc.children].forEach(c => c.classList.toggle("on", c === b)); refilter() }; sc.appendChild(b)
        });
        const mainEl = document.querySelector("main"), fsb = document.getElementById("fsb");
        function setFS(on) { mainEl.classList.toggle("fs", on); fsb.textContent = on ? "✕ Esci" : "⛶ Schermo intero"; layout() }
        fsb.onclick = () => {
            if (!mainEl.classList.contains("fs")) { setFS(true); if (mainEl.requestFullscreen) mainEl.requestFullscreen().catch(() => { }) }
            else { setFS(false); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }) }
        };
        document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && mainEl.classList.contains("fs")) setFS(false) });
        document.addEventListener("keydown", e => { if (e.key === "Escape" && mainEl.classList.contains("fs") && !document.fullscreenElement) setFS(false) });
        matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { dirty = true; sched() });
        new ResizeObserver(layout).observe(wrap);
        vv.textContent = "almeno " + minV + " voti"; layout(); refilter();
    });