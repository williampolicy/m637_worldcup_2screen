# m637 · World Cup 二屏球迷游戏 (World Cup 2nd-Screen)

> ## ⚠️ 已合并 / MERGED & DEPRECATED (2026-06-30)
> 本仓库是 m637 的早期 Phase-0 静态 demo。为消除 **同一 project id `m637` 的重复**，
> 它已被**合并**进统一的 m637 产品：`m637_worldfootballtwin`，线上 **https://football.x1000.ai**。
> 本项目的三屏联动回放（战术球场 + 传球网络 d3-force + xT 累计曲线）现在是统一 m637 的
> **「观看比赛 / Watch」模式**（SPADL 事件流 `GET /api/matches/{id}/events` → `web/js/replay.js`），
> 与「自建比赛 / Play」+ 3D 阵容同处一个产品。
> **本仓库不再维护；GitHub Pages 现为跳转页。** 旧版静态 demo 存档见 `index_legacy.html`。
> Canonical m637 = **football.x1000.ai**。

独立游戏项目(与 m505_epic_game / m595_rescue_game 平级)。供需两头夹裁决环的 **forcing function**:
验证 m459 裁决 `CAP-FE-02 = FORGE`(球迷二屏前端) —— **一场比赛 × 二屏 × 实时**。

> 由 m459(裁决器)蓝图 `M637_DEMO_BUILD_MANIFEST.md` 驱动。**Phase 0**: 合成数据, 零 owner-gated 依赖。
> 公网部署: 纯静态 → GitHub Pages(即时) / Cloudflare Pages(Phase1 API + x1000.ai 域名)。

## 在线访问
- **GitHub Pages**(即时·Phase0): 见仓库 Settings → Pages 的 URL(本仓库已开)。
- **Cloudflare Pages**(Phase1·荐): CF 面板 → Pages → 连本 GitHub 仓库, build output dir = `/`(根), Functions 自动识别 → 绑 `m637.x1000.ai`(owner 铸 DNS/token)。

## 三屏(同一时间轴驱动)
1. **战术球场** — SVG 球场 + 当前动作箭头 + 球员高亮 + 进球标记
2. **传球网络 (d3-force)** — 球员节点(力布局收敛于平均站位), 边宽=至今成功传球次数
3. **xT 价值曲线** — 两队累计期望威胁随时间, 当前游标

## ★ Phase 0 → Phase 1 热插拔
视图层 `app.js` 只经 `window.MatchData` 的 `getMeta/getPlayers/getEvents` 取数(events=SPADL-ish)。
- **Phase 0**(当前): 静态 `mock_match.js` 提供数据, **纯静态托管即可**, 无需 API。
- **Phase 1**(待 m582 采纳 C2 + 下载 IDSSE/Sportec + 接 socceraction): `functions/api/match.js` 返回同形真实数据,
  前端 `fetch('/api/match')` 填充 `window.MatchData` 即换真实 xT/tracking, **`app.js` 一行不改**。
  许可闸 owner-gated: **IDSSE/Sportec=CC-BY 可商用**; StatsBomb/SoccerNet=非商用勿商用。

## 本地预览(可选, 仅同机)
```bash
python3 -m http.server 8741   # 开 http://localhost:8741
```
> 注: 需联网(d3 走 CDN)。SSH 远程无 GUI 时请用上面的公网 URL。

## 结构
```
index.html  app.js  mock_match.js   # 静态前端(Phase 0)
functions/api/match.js              # CF Pages Function — Phase 1 API 占位(/api/match)
wrangler.toml                       # CF Pages 配置
```

## 红线
- Phase 0 合成数据(非真实赛事·不碰版权); 真实赛事数据是 Phase 1 且许可闸 owner-gated。
- m459 不构建本项目(守裁决器本分); m637 由本仓库独立承载。
