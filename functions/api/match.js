/*
 * m637 · CF Pages Function — Phase 1 轻量 API 占位 (route: /api/match)
 * ----------------------------------------------------------------------------
 * Phase 0(当前): 前端直接用静态 mock_match.js, **不需要本 API**, CF Pages 纯静态托管即可。
 * Phase 1: 待 m582 采纳 C2 + 下载 IDSSE/Sportec(CC-BY) + 接 socceraction 算真实 xT 后,
 *          在此返回同形 JSON(getMeta/getPlayers/getEvents 的数据), 前端 fetch('/api/match')
 *          替换 window.MatchData 即换真实数据。许可闸 owner-gated(勿用 StatsBomb/SoccerNet 做商业版)。
 *
 * 现返回 stub, 让 /api/match 路由可探活、形状可见。
 */
export async function onRequest(context) {
  const body = {
    status: "stub",
    phase: 0,
    note: "Phase 0 用静态 mock_match.js。Phase 1 在此接 socceraction/IDSSE 真实数据(同形)。",
    adapter_api: ["getMeta", "getPlayers", "getEvents"],
    event_schema: "SPADL-ish: {id,minute,second,team,player,type,start_x,start_y,end_x,end_y,outcome,xt_delta}",
    license_gate: "owner-gated: IDSSE/Sportec=CC-BY 可商用; StatsBomb/SoccerNet=非商用勿商用",
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
