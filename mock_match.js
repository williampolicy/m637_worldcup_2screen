/*
 * m637 世界杯二屏 Demo · Phase 0 数据适配器 (mock)
 * ----------------------------------------------------------------------------
 * 这是 forcing-function demo 的【数据底座】。Phase 0 用合成数据, 不依赖 m582 salvage。
 *
 * ★ Phase 1 热插拔边界 ★
 * app.js 只通过 window.MatchData 的 API 取数 —— getMeta()/getPlayers()/getEvents()。
 * Phase 1(待 m582 采纳 C2 并下载 IDSSE/接 socceraction)只需提供一个同形 real_match.js
 * 实现这三个方法(events 为 SPADL 格式), 视图层一行不改即可换成真实 xT/tracking。
 *
 * events 采用 SPADL-ish 字段(对齐 socceraction 输出, 便于 Phase 1 对接):
 *   { id, minute, second, team, player, type, start_x, start_y, end_x, end_y, outcome, xt_delta }
 *   坐标系: 标准球场 x∈[0,105](长), y∈[0,68](宽); team∈{HOME,AWAY}; xt_delta=该动作期望威胁增量。
 */
(function () {
  const meta = {
    fixture: "World Cup · Demo Slice — HOME 2 : 1 AWAY",
    competition: "FIFA World Cup (synthetic)",
    note: "Phase 0 合成数据 · 非真实赛事 · 仅验证二屏壳",
    pitch: { length: 105, width: 68 },
  };

  // 球员: 阵型平均位置(传球网络节点定位用)。x 沿进攻方向 0→105。
  const players = [
    // HOME (左→右进攻)
    { id: "H1", team: "HOME", num: 1, name: "GK", x: 6, y: 34 },
    { id: "H2", team: "HOME", num: 2, name: "RB", x: 28, y: 56 },
    { id: "H3", team: "HOME", num: 4, name: "CB", x: 22, y: 40 },
    { id: "H4", team: "HOME", num: 5, name: "CB", x: 22, y: 28 },
    { id: "H5", team: "HOME", num: 3, name: "LB", x: 28, y: 12 },
    { id: "H6", team: "HOME", num: 6, name: "DM", x: 42, y: 34 },
    { id: "H7", team: "HOME", num: 8, name: "CM", x: 56, y: 48 },
    { id: "H8", team: "HOME", num: 10, name: "AM", x: 66, y: 34 },
    { id: "H9", team: "HOME", num: 7, name: "RW", x: 78, y: 58 },
    { id: "H10", team: "HOME", num: 11, name: "LW", x: 78, y: 10 },
    { id: "H11", team: "HOME", num: 9, name: "ST", x: 88, y: 34 },
    // AWAY (镜像)
    { id: "A1", team: "AWAY", num: 1, name: "GK", x: 99, y: 34 },
    { id: "A2", team: "AWAY", num: 2, name: "RB", x: 77, y: 12 },
    { id: "A3", team: "AWAY", num: 4, name: "CB", x: 83, y: 28 },
    { id: "A4", team: "AWAY", num: 5, name: "CB", x: 83, y: 40 },
    { id: "A5", team: "AWAY", num: 3, name: "LB", x: 77, y: 56 },
    { id: "A6", team: "AWAY", num: 6, name: "DM", x: 63, y: 34 },
    { id: "A7", team: "AWAY", num: 8, name: "CM", x: 49, y: 20 },
    { id: "A8", team: "AWAY", num: 10, name: "AM", x: 39, y: 34 },
    { id: "A9", team: "AWAY", num: 7, name: "RW", x: 27, y: 10 },
    { id: "A10", team: "AWAY", num: 11, name: "LW", x: 27, y: 58 },
    { id: "A11", team: "AWAY", num: 9, name: "ST", x: 17, y: 34 },
  ];

  // 一段可读的比赛事件流(SPADL-ish)。两次 HOME 进攻成功(进球高 xt), 一次 AWAY 反击。
  const e = [];
  let id = 0;
  const ev = (minute, second, team, player, type, sx, sy, ex, ey, outcome, xt) =>
    e.push({ id: ++id, minute, second, team, player, type, start_x: sx, start_y: sy, end_x: ex, end_y: ey, outcome, xt_delta: xt });

  // —— HOME 第一波推进 → 进球 (5'–7') ——
  ev(5, 10, "HOME", "H4", "pass", 22, 28, 42, 34, "success", 0.01);
  ev(5, 14, "HOME", "H6", "pass", 42, 34, 56, 48, "success", 0.02);
  ev(5, 19, "HOME", "H7", "carry", 56, 48, 64, 52, "success", 0.02);
  ev(5, 23, "HOME", "H7", "pass", 64, 52, 66, 34, "success", 0.04);
  ev(5, 27, "HOME", "H8", "carry", 66, 34, 74, 34, "success", 0.05);
  ev(5, 31, "HOME", "H8", "pass", 74, 34, 84, 40, "success", 0.08);
  ev(5, 35, "HOME", "H9", "cross", 84, 40, 90, 32, "success", 0.10);
  ev(5, 38, "HOME", "H11", "shot", 90, 32, 105, 35, "goal", 0.62);
  // —— AWAY 控球回应 (8'–10') ——
  ev(8, 5, "AWAY", "A1", "pass", 99, 34, 83, 40, "success", 0.0);
  ev(8, 9, "AWAY", "A4", "pass", 83, 40, 63, 34, "success", 0.01);
  ev(8, 14, "AWAY", "A6", "carry", 63, 34, 55, 30, "success", 0.02);
  ev(8, 18, "AWAY", "A6", "pass", 55, 30, 49, 20, "success", 0.02);
  ev(8, 23, "AWAY", "A7", "pass", 49, 20, 39, 34, "success", 0.03);
  ev(8, 27, "AWAY", "A8", "carry", 39, 34, 30, 34, "success", 0.04);
  ev(8, 31, "AWAY", "A8", "shot", 30, 34, 0, 33, "saved", 0.09);
  // —— AWAY 反击扳回 (12') ——
  ev(12, 2, "AWAY", "A11", "carry", 17, 34, 25, 36, "success", 0.03);
  ev(12, 6, "AWAY", "A11", "pass", 25, 36, 27, 58, "success", 0.05);
  ev(12, 10, "AWAY", "A10", "cross", 27, 58, 14, 33, "success", 0.12);
  ev(12, 13, "AWAY", "A9", "shot", 14, 33, 0, 34, "goal", 0.55);
  // —— HOME 再下一城 (18') ——
  ev(18, 4, "HOME", "H6", "pass", 42, 34, 66, 34, "success", 0.05);
  ev(18, 9, "HOME", "H8", "pass", 66, 34, 78, 10, "success", 0.07);
  ev(18, 13, "HOME", "H10", "carry", 78, 10, 88, 14, "success", 0.08);
  ev(18, 17, "HOME", "H10", "pass", 88, 14, 90, 34, "success", 0.14);
  ev(18, 20, "HOME", "H11", "shot", 90, 34, 105, 36, "goal", 0.66);

  window.MatchData = {
    // ★ Phase 1 适配器 API (real_match.js 实现同形即可热插拔) ★
    getMeta() { return meta; },
    getPlayers() { return players; },
    getEvents() { return e; },
  };
})();
