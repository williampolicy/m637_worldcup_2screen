# m637 · World Cup 二屏球迷游戏 — 项目指引

## 1. 是什么
独立游戏项目(平级 m505_epic_game / m595_rescue_game)。世界杯单场二屏球迷体验:
战术球场 + 传球网络(d3-force) + xT 价值曲线, 同一时间轴回放联动。
是生态"供需两头夹"裁决环的 forcing function —— 验证 m459 裁决 `CAP-FE-02 = FORGE`(球迷二屏前端)。

## 2. 来源 / 上游
- 蓝图: m459 `docs/M637_DEMO_BUILD_MANIFEST.md`(裁决器 game_capability_arbiter 产)。
- 底座: viz 来自 m495 skill(d3_force/leaflet/recharts 范式); 引擎参考 m505/m595。
- 数据(Phase 1): m582 salvage IDSSE/Sportec(CC-BY) + socceraction(VAEP/xT)。

## 3. 两阶段
- **Phase 0**(当前): 合成 SPADL 数据(`mock_match.js`), 纯静态, 零 owner-gated 依赖。
- **Phase 1**: `functions/api/match.js` 接真实数据(同形), 前端零改热插拔。

## 4. 部署
- 纯静态 → GitHub Pages(即时) / Cloudflare Pages(Phase1 API + `m637.x1000.ai`)。
- CF Pages: build output dir = `/`(根), Functions 自动从 `./functions`。

## 5. 铁律
- Phase 0 合成数据, **不碰真实赛事版权**; 真实数据=Phase 1 且**许可闸 owner-gated**
  (IDSSE/Sportec=CC-BY 可商用; StatsBomb/SoccerNet=非商用勿用于商业版)。
- m459 是裁决器不构建本项目; 本项目独立承载 m637。
- 域名/CF token/DNS = owner-gated。
