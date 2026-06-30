/*
 * m637 世界杯二屏 Demo · Phase 0 视图层
 * 三屏(球场/传球网络/xT 曲线)共享一个时间轴 t(秒)。只经 window.MatchData API 取数,
 * 故 Phase 1 换真实数据时本文件零改动。纯 d3 v7, 无构建步, 自包含。
 */
(function () {
  const D = window.MatchData;
  const meta = D.getMeta(), players = D.getPlayers(), events = D.getEvents();
  const COL = { HOME: "#39a0ff", AWAY: "#ff5d6c", ACC: "#ffd54a" };
  const P = meta.pitch; // {length:105,width:68}
  const tOf = (e) => e.minute * 60 + e.second;
  const maxT = tOf(events[events.length - 1]) + 3;
  const byId = new Map(players.map((p) => [p.id, p]));

  document.getElementById("fixture").textContent = meta.fixture;

  // 推断传球接球人: 成功传球的接球人 = 下一动作球员(若同队)。用于传球网络边。
  const passEdges = []; // {src,dst,team,t}
  for (let i = 0; i < events.length; i++) {
    const e = events[i], n = events[i + 1];
    if (e.type === "pass" && e.outcome === "success" && n && n.team === e.team && n.player !== e.player) {
      passEdges.push({ src: e.player, dst: n.player, team: e.team, t: tOf(e) });
    }
  }

  // ---------- ① 球场 ----------
  const pitch = d3.select("#pitch");
  function drawPitchLines() {
    const g = pitch.append("g");
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", P.length).attr("height", P.width).attr("fill", "#16321f");
    const L = (x1, y1, x2, y2) => g.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke", "#3c6e4d").attr("stroke-width", 0.3);
    L(52.5, 0, 52.5, 68); // halfway
    g.append("circle").attr("cx", 52.5).attr("cy", 34).attr("r", 9.15).attr("fill", "none").attr("stroke", "#3c6e4d").attr("stroke-width", 0.3);
    g.append("rect").attr("x", 0).attr("y", 0).attr("width", P.length).attr("height", P.width).attr("fill", "none").attr("stroke", "#3c6e4d").attr("stroke-width", 0.3);
    // 禁区 + 球门
    [true, false].forEach((left) => {
      const bx = left ? 0 : P.length - 16.5;
      g.append("rect").attr("x", bx).attr("y", 13.85).attr("width", 16.5).attr("height", 40.3).attr("fill", "none").attr("stroke", "#3c6e4d").attr("stroke-width", 0.3);
      g.append("rect").attr("x", left ? -0.6 : P.length).attr("y", 30.34).attr("width", 0.6).attr("height", 7.32).attr("fill", "none").attr("stroke", "#cfe9d8").attr("stroke-width", 0.3);
    });
  }
  drawPitchLines();
  const playersLayer = pitch.append("g");
  const actionLayer = pitch.append("g");
  // 平均位置球员点(底图)
  playersLayer.selectAll("circle").data(players).join("circle")
    .attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", 1.3)
    .attr("fill", (d) => COL[d.team]).attr("opacity", 0.35).attr("data-id", (d) => d.id);
  playersLayer.selectAll("text").data(players).join("text")
    .attr("x", (d) => d.x).attr("y", (d) => d.y - 1.8).attr("text-anchor", "middle")
    .attr("font-size", 1.8).attr("fill", "#cdd9ee").attr("opacity", 0.5).text((d) => d.num);

  function renderPitch(t) {
    const cur = currentEvent(t);
    playersLayer.selectAll("circle").attr("opacity", (d) => (cur && d.id === cur.player ? 1 : 0.35))
      .attr("r", (d) => (cur && d.id === cur.player ? 2.2 : 1.3))
      .attr("stroke", (d) => (cur && d.id === cur.player ? COL.ACC : "none")).attr("stroke-width", 0.4);
    actionLayer.selectAll("*").remove();
    if (!cur) return;
    const c = cur.outcome === "goal" ? COL.ACC : COL[cur.team];
    actionLayer.append("defs").html(
      `<marker id="ah" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${c}"/></marker>`);
    actionLayer.append("line").attr("x1", cur.start_x).attr("y1", cur.start_y).attr("x2", cur.end_x).attr("y2", cur.end_y)
      .attr("stroke", c).attr("stroke-width", cur.type === "shot" ? 0.9 : 0.55)
      .attr("stroke-dasharray", cur.type === "carry" ? "1.2,1" : null).attr("marker-end", "url(#ah)");
    actionLayer.append("circle").attr("cx", cur.start_x).attr("cy", cur.start_y).attr("r", 1.1).attr("fill", c);
    if (cur.outcome === "goal")
      actionLayer.append("text").attr("x", cur.end_x - 6).attr("y", cur.end_y - 2).attr("font-size", 3).attr("font-weight", 700).attr("fill", COL.ACC).text("GOAL");
  }

  // ---------- ② 传球网络 (d3-force 同步布局一次) ----------
  const netSvg = d3.select("#net");
  let netReady = false, netNodes, netG;
  function buildNetwork() {
    const W = netSvg.node().clientWidth || 460, H = netSvg.node().clientHeight || 240;
    netSvg.attr("viewBox", `0 0 ${W} ${H}`);
    const sx = d3.scaleLinear().domain([0, P.length]).range([24, W - 24]);
    const sy = d3.scaleLinear().domain([0, P.width]).range([20, H - 20]);
    netNodes = players.map((p) => ({ ...p, fx: null, fy: null, tx: sx(p.x), ty: sy(p.y) }));
    const sim = d3.forceSimulation(netNodes)
      .force("x", d3.forceX((d) => d.tx).strength(0.35))
      .force("y", d3.forceY((d) => d.ty).strength(0.35))
      .force("charge", d3.forceManyBody().strength(-22))
      .force("collide", d3.forceCollide(10)).stop();
    for (let i = 0; i < 160; i++) sim.tick(); // 同步收敛, 确定性, 无动画循环
    netG = netSvg.append("g");
    netG.append("g").attr("class", "edges");
    const nd = netG.append("g").selectAll("g").data(netNodes).join("g").attr("data-id", (d) => d.id);
    nd.append("circle").attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", 7).attr("fill", (d) => COL[d.team]).attr("opacity", 0.9);
    nd.append("text").attr("x", (d) => d.x).attr("y", (d) => d.y + 3).attr("text-anchor", "middle").attr("font-size", 8).attr("font-weight", 700).attr("fill", "#06101f").text((d) => d.num);
    netReady = true;
  }
  function renderNetwork(t) {
    if (!netReady) buildNetwork();
    const pos = new Map(netNodes.map((n) => [n.id, n]));
    const counts = new Map();
    passEdges.filter((e) => e.t <= t).forEach((e) => {
      const k = e.src < e.dst ? e.src + "|" + e.dst : e.dst + "|" + e.src;
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    const edges = [...counts.entries()].map(([k, c]) => { const [a, b] = k.split("|"); return { a, b, c, team: pos.get(a).team }; });
    const cur = currentEvent(t);
    netG.select(".edges").selectAll("line").data(edges, (d) => d.a + d.b).join("line")
      .attr("x1", (d) => pos.get(d.a).x).attr("y1", (d) => pos.get(d.a).y)
      .attr("x2", (d) => pos.get(d.b).x).attr("y2", (d) => pos.get(d.b).y)
      .attr("stroke", (d) => COL[d.team]).attr("stroke-opacity", 0.5).attr("stroke-width", (d) => 0.8 + d.c * 1.4);
    netG.selectAll("g[data-id] circle").attr("stroke", (d) => (cur && d.id === cur.player ? COL.ACC : "none")).attr("stroke-width", 2)
      .attr("r", (d) => 7 + (cur && d.id === cur.player ? 2 : 0));
  }

  // ---------- ③ xT 累计曲线 ----------
  const xtSvg = d3.select("#xt");
  const cum = { HOME: [{ t: 0, v: 0 }], AWAY: [{ t: 0, v: 0 }] };
  let runH = 0, runA = 0;
  events.forEach((e) => {
    if (e.team === "HOME") { runH += e.xt_delta; cum.HOME.push({ t: tOf(e), v: runH }); }
    else { runA += e.xt_delta; cum.AWAY.push({ t: tOf(e), v: runA }); }
  });
  const maxV = Math.max(runH, runA, 0.5);
  function renderXt(t) {
    const W = xtSvg.node().clientWidth || 460, H = xtSvg.node().clientHeight || 150;
    xtSvg.attr("viewBox", `0 0 ${W} ${H}`);
    const x = d3.scaleLinear().domain([0, maxT]).range([34, W - 8]);
    const y = d3.scaleLinear().domain([0, maxV]).range([H - 18, 8]);
    xtSvg.selectAll("*").remove();
    // 轴
    xtSvg.append("line").attr("x1", 34).attr("y1", H - 18).attr("x2", W - 8).attr("y2", H - 18).attr("stroke", "#22304d");
    xtSvg.append("line").attr("x1", 34).attr("y1", 8).attr("x2", 34).attr("y2", H - 18).attr("stroke", "#22304d");
    xtSvg.append("text").attr("x", 2).attr("y", 12).attr("font-size", 9).attr("fill", "#8aa0c2").text(maxV.toFixed(1));
    xtSvg.append("text").attr("x", 2).attr("y", H - 20).attr("font-size", 9).attr("fill", "#8aa0c2").text("xT");
    const line = d3.line().x((d) => x(d.t)).y((d) => y(d.v)).curve(d3.curveStepAfter);
    ["HOME", "AWAY"].forEach((tm) => {
      const data = cum[tm].filter((d) => d.t <= t);
      if (data.length && data[data.length - 1].t < t) data.push({ t, v: data[data.length - 1].v });
      xtSvg.append("path").datum(data).attr("fill", "none").attr("stroke", COL[tm]).attr("stroke-width", 2).attr("d", line);
      const last = data[data.length - 1];
      if (last) xtSvg.append("circle").attr("cx", x(last.t)).attr("cy", y(last.v)).attr("r", 3).attr("fill", COL[tm]);
    });
    xtSvg.append("line").attr("x1", x(t)).attr("y1", 8).attr("x2", x(t)).attr("y2", H - 18).attr("stroke", "#ffd54a").attr("stroke-opacity", 0.4).attr("stroke-dasharray", "2,2");
  }

  // ---------- 共享时间轴 / 联动 ----------
  function currentEvent(t) {
    let cur = null;
    for (const e of events) { if (tOf(e) <= t) cur = e; else break; }
    return cur;
  }
  function fmt(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"); }
  function render(t) {
    renderPitch(t); renderNetwork(t); renderXt(t);
    let gh = 0, ga = 0;
    events.forEach((e) => { if (tOf(e) <= t && e.outcome === "goal") (e.team === "HOME" ? gh++ : ga++); });
    document.getElementById("scoreH").textContent = gh;
    document.getElementById("scoreA").textContent = ga;
    document.getElementById("clock").textContent = fmt(t);
    const cur = currentEvent(t);
    document.getElementById("evlabel").textContent = cur
      ? `${fmt(tOf(cur))}  ${cur.team} #${byId.get(cur.player).num} ${byId.get(cur.player).name} · ${cur.type}${cur.outcome === "goal" ? " ⚽GOAL" : cur.outcome === "saved" ? " (扑救)" : ""} · ΔxT ${cur.xt_delta.toFixed(2)}`
      : "—";
  }

  // ---------- 播放控制 ----------
  let t = 0, timer = null;
  const scrub = document.getElementById("scrub"), playBtn = document.getElementById("play");
  function setT(nt) { t = Math.max(0, Math.min(maxT, nt)); scrub.value = (t / maxT) * 100; render(t); }
  scrub.addEventListener("input", () => setT((scrub.value / 100) * maxT));
  playBtn.addEventListener("click", () => {
    if (timer) { clearInterval(timer); timer = null; playBtn.textContent = "▶ 播放"; return; }
    if (t >= maxT) setT(0);
    playBtn.textContent = "⏸ 暂停";
    timer = setInterval(() => { setT(t + 4); if (t >= maxT) { clearInterval(timer); timer = null; playBtn.textContent = "▶ 播放"; } }, 220);
  });
  document.getElementById("reset").addEventListener("click", () => { if (timer) { clearInterval(timer); timer = null; playBtn.textContent = "▶ 播放"; } setT(0); });
  window.addEventListener("resize", () => { netReady = false; netSvg.selectAll("*").remove(); render(t); });

  setT(0);
})();
