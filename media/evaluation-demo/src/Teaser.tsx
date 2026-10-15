import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import data from "../public/data.json";
import { AgentIcon, GitHubIcon, HuggingFaceIcon, JudgeIcon, UserAvatar } from "./Icons";
import { Results, RESULTS_FRAMES } from "./Results";
import { INK, KIND, LINE, MONO, MUTED, NAVY, NODE_EDGE, NODE_FILL, PAPER, SANS, VERDICT } from "./theme";

const FPS = 30;
const S = (s: number) => Math.round(s * FPS);
const HOOK = S(2.6);
/** For illustration only (the teasers): request 1's real verdicts are six passes and one partial; two
 * of them are shown as a fail and a partial so the viewer sees every grade early. The pass rate shown
 * for R1 is recomputed from these; the main film and the scoring stay on the real trace. */
const DEMO_VERDICTS: Record<number, Record<number, string>> = { 0: { 4: "no", 6: "partial" } };
const shownChecks = (i: number) => data.requests[i].checks.map((c, k) => ({ ...c, verdict: DEMO_VERDICTS[i]?.[k] ?? c.verdict }));
const shownAccuracy = (i: number) => {
  const cs = shownChecks(i);
  return (100 * cs.reduce((a, c) => a + (c.verdict === "yes" ? 1 : c.verdict === "partial" ? 0.5 : 0), 0)) / cs.length;
};
const SHOWN_ACC = data.accuracy.map((a, i) => (i < 3 ? shownAccuracy(i) : a));
const FAST = S(7);
const END = S(2);
/** The stage times of one request, in frames: everything waits for the stage before it. */
const timing = (i: number) => {
  const req = data.requests[i];
  const tAgent = S(0.7);
  const callLen = 3; // frames per tool call line
  const tBuilt = tAgent + req.calls.length * callLen + 6; // the build line lands
  const tJudge = tBuilt + 16; // eval starts only once the build is done
  const rowLen = 13; // frames per check: the row pops, the judge works it, its verdict lands
  const span = req.checks.length * rowLen + 10; // the judge browses for as long as the checks take
  const stepLen = Math.ceil(span / req.judge.steps.length);
  const tChecks = tJudge; // the checks list opens with the judge
  const tScore = tJudge + span + 14; // every verdict is in, then the number
  const len = tScore + S(1.3);
  return { tAgent, callLen, tBuilt, tJudge, stepLen, tChecks, rowLen, tScore, len };
};
const ITER_LENS = [0, 1, 2].map((i) => timing(i).len);
const ITER_TOTAL = ITER_LENS.reduce((a, b) => a + b, 0);
export const teaserFrames = (results: boolean, hook = true) => (hook ? HOOK : 0) + ITER_TOTAL + FAST + (results ? RESULTS_FRAMES : 0) + END;

const useTall = () => {
  const { width, height } = useVideoConfig();
  return { tall: width / height < 1.3, W: width, H: height };
};

const fadeIn = (f: number, len = 10) => interpolate(f, [0, len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Strip: React.FC<{ lit: number; current: number; y?: number; scale?: number }> = ({ lit, current, y = 40, scale = 1 }) => (
  <div style={{ position: "absolute", top: y, left: "50%", transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center", display: "flex", gap: 10, fontFamily: SANS }}>
    {Array.from({ length: 10 }, (_, i) => {
      const on = i < lit || i === current;
      return (
        <div key={i} style={{ width: 112, height: 58, borderRadius: 11, border: `2.5px solid ${on ? NODE_EDGE[i % 5] : LINE}`, background: on ? NODE_FILL[i % 5] : "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: on ? NAVY : MUTED, boxShadow: i === current ? `0 0 0 5px ${NODE_EDGE[i % 5]}33` : "none" }}>
          <div style={{ fontWeight: 700, fontSize: 22 }}>R{i + 1}</div>
          <div style={{ fontSize: 15, color: INK, opacity: i < lit ? 1 : 0 }}>{SHOWN_ACC[i].toFixed(0)}%</div>
        </div>
      );
    })}
  </div>
);

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const p = spring({ frame: f, fps: FPS, config: { damping: 200 } });
  const { tall, H } = useTall();
  if (tall) {
    return (
      <AbsoluteFill style={{ fontFamily: SANS, color: NAVY }}>
        <div style={{ position: "absolute", left: 60, right: 60, top: H * 0.22, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: MUTED }}>EVOWEB · A BENCHMARK FOR CODING AGENTS</div>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.12, marginTop: 22 }}>How well do coding agents sustain long-horizon follow-up requests?</div>
        </div>
        <div style={{ opacity: fadeIn(f - 25, 15) }}>
          <Strip lit={0} current={-1} y={H * 0.66} scale={0.8} />
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: H * 0.66 + 80, textAlign: "center", fontSize: 26, color: INK, lineHeight: 1.35, opacity: fadeIn(f - 35, 15) }}>
          32 apps · 10 requests each · a browser agent tests the running app after every request
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: NAVY }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
        <div style={{ fontSize: 30, letterSpacing: 4, color: MUTED }}>EVOWEB · A BENCHMARK FOR CODING AGENTS</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.12, marginTop: 26 }}>
          How well do coding agents sustain
          <br />
          long-horizon follow-up requests?
        </div>
      </div>
      <div style={{ opacity: fadeIn(f - 25, 15) }}>
        <Strip lit={0} current={-1} y={700} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontSize: 32, color: INK, opacity: fadeIn(f - 35, 15) }}>
        32 apps · 10 requests each · a browser agent tests the running app after every request
      </div>
    </AbsoluteFill>
  );
};

/** An arrow that pops in: direction "down" or "right". */
const Arrow: React.FC<{ x: number; y: number; dir: "down" | "right"; at: number; len?: number }> = ({ x, y, dir, at, len = 60 }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - at, fps: FPS, config: { damping: 12, stiffness: 170 } });
  const w = dir === "right" ? len : 26, h = dir === "down" ? len : 26;
  const path = dir === "right" ? `M2 13 H${len - 14} M${len - 24} 4 L${len - 12} 13 L${len - 24} 22` : `M13 2 V${len - 14} M4 ${len - 24} L13 ${len - 12} L22 ${len - 24}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: x, top: y, opacity: p, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: dir === "right" ? "left center" : "center top" }}>
      <path d={path} stroke={NAVY} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const ColumnHead: React.FC<{ x: number; y: number; w: number; label: string; sub: string; color: string; at: number }> = ({ x, y, w, label, sub, color, at }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: fadeIn(f - at, 10), fontFamily: SANS }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderBottom: `3px solid ${color}`, paddingBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color }}>{label}</span>
        <span style={{ fontSize: 18, color: MUTED }}>{sub}</span>
      </div>
    </div>
  );
};

const Iteration: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const req = data.requests[i];
  const { tall, H } = useTall();
  const { tAgent, callLen, tBuilt, tJudge, stepLen, tChecks, rowLen, tScore } = timing(i);
  const checksShown = shownChecks(i);
  const accShown = SHOWN_ACC[i];
  const steps = req.judge.steps;
  const stepIdx = Math.max(0, Math.min(steps.length - 1, Math.floor((f - tJudge) / stepLen)));
  const shot = steps[stepIdx];
  const stepLocal = f - tJudge - stepIdx * stepLen;
  const lastStep = stepIdx === steps.length - 1;
  const zoom = 1 + 0.015 * Math.min(1, Math.max(0, stepLocal / stepLen));
  const rowIn = (k: number) => spring({ frame: f - (tChecks + 4 + k * rowLen), fps: FPS, config: { damping: 200, stiffness: 160 } });
  const chipsDone = (k: number) => f > tChecks + 4 + k * rowLen + rowLen * 0.75;
  const built = f >= tBuilt;
  const bubble = spring({ frame: f, fps: FPS, config: { damping: 16, stiffness: 150 } });
  const agent = spring({ frame: f - tAgent, fps: FPS, config: { damping: 200 } });
  const judge = spring({ frame: f - tJudge, fps: FPS, config: { damping: 200 } });
  const checks = spring({ frame: f - tChecks, fps: FPS, config: { damping: 200 } });
  const score = spring({ frame: f - tScore, fps: FPS, config: { damping: 12, stiffness: 150 } });
  const nCalls = Math.min(req.calls.length, Math.floor((f - tAgent) / callLen));
  const GEN = "#2f5f8f", EVAL = "#3f8f5f";
  // layout
  const L = tall
    ? { headY: 100, bubble: { left: 40, top: 150, width: 1000 }, arrowDown1: { x: 200, y: 300 }, agent: { left: 40, top: 360, width: 380, height: H > 1200 ? 420 : 300 }, arrowRight: { x: 428, y: 520 }, judge: { left: 480, top: 360, width: 560 }, shotW: 560, arrowDown2: { x: 740, y: 760 }, checks: { left: 480, top: 820, width: 560 }, score: { left: 40, top: H > 1200 ? 820 : 690, width: 380 }, scoreSize: 64, bubbleFont: 24, strip: 0.78, chipFont: 15, chipRow: 36 }
    : { headY: 108, bubble: { left: 90, top: 160, width: 770 }, arrowDown1: { x: 300, y: 318 }, agent: { left: 90, top: 380, width: 770, height: 360 }, arrowRight: { x: 872, y: 540 }, judge: { left: 980, top: 160, width: 850 }, shotW: 850, arrowDown2: { x: 1392, y: 640 }, checks: { left: 980, top: 700, width: 850 }, score: { left: 90, top: 790, width: 770 }, scoreSize: 72, bubbleFont: 25, strip: 0.9, chipFont: 19, chipRow: 44 };
  const shotH = (L.shotW * 375) / 768;
  const chipRow = Math.min(L.chipRow, (H - L.checks.top - 80) / req.checks.length);
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Strip lit={f > tScore + 6 ? i + 1 : i} current={i} y={34} scale={L.strip} />
      <ColumnHead x={L.bubble.left} y={L.headY} w={tall ? 1000 : L.bubble.width} label="GENERATION" sub="the user asks, the coding agent builds" color={GEN} at={0} />
      {!tall && <ColumnHead x={L.judge.left} y={L.headY} w={L.judge.width} label="EVALUATION" sub="a browser agent judges the live app" color={EVAL} at={tJudge - 8} />}
      {/* 1. the user asks */}
      <div style={{ position: "absolute", ...L.bubble, display: "flex", gap: 18, alignItems: "flex-start", opacity: bubble, transform: `scale(${0.92 + 0.08 * bubble})`, transformOrigin: "left top" }}>
        <UserAvatar size={64} />
        <div style={{ background: "#fff", border: `2px solid ${NAVY}`, borderRadius: 18, padding: "14px 22px", fontSize: L.bubbleFont, lineHeight: 1.32, color: INK, flex: 1 }}>
          <div style={{ fontSize: 15, color: MUTED, letterSpacing: 1, marginBottom: 6 }}>REQUEST {i + 1} OF 10</div>
          {req.text}
        </div>
      </div>
      {/* 2. the agent builds */}
      <Arrow x={L.arrowDown1.x} y={L.arrowDown1.y} dir="down" at={tAgent - 10} len={52} />
      <div style={{ position: "absolute", ...L.agent, background: "#0f1b2d", borderRadius: 16, padding: "14px 20px", color: "#d6e2f0", fontFamily: MONO, fontSize: tall ? 17 : 19, lineHeight: 1.5, opacity: agent, transform: `translateY(${(1 - agent) * 20}px)`, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9fb3cc", fontFamily: SANS, fontSize: 18, marginBottom: 6 }}>
          <AgentIcon size={26} color="#9fb3cc" /> coding agent · {req.calls.length} tool calls
        </div>
        {req.calls.slice(0, Math.max(0, nCalls)).slice(-(tall ? 6 : 7)).map((c, k) => (
          <div key={k} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ color: c.kind === "edit" ? "#f2c879" : "#7fd1a8" }}>{c.kind === "edit" ? "✎ " : "▶ "}</span>
            {c.title}
          </div>
        ))}
        {built && <div style={{ color: "#7fd1a8", marginTop: 4, whiteSpace: "nowrap" }}>▶ npm run build &nbsp;✓ {tall ? "built, live" : "built · app is live"}</div>}
      </div>
      {/* 3. the judge browses */}
      <Arrow x={L.arrowRight.x} y={L.arrowRight.y} dir="right" at={tJudge - 10} len={tall ? 48 : 100} />
      {tall && <ColumnHead x={L.judge.left} y={L.judge.top - 50} w={L.judge.width} label="EVALUATION" sub="browser agent" color={EVAL} at={tJudge - 8} />}
      <div style={{ position: "absolute", ...L.judge, opacity: judge, transform: `translateY(${(1 - judge) * 20}px)` }}>
        <div style={{ borderRadius: 14, overflow: "hidden", border: `1.5px solid ${LINE}`, background: "#0b1626" }}>
          <div style={{ width: L.shotW, height: shotH, overflow: "hidden", position: "relative" }}>
            <Img src={staticFile(shot.shot)} style={{ width: L.shotW, height: shotH, display: "block", transform: `scale(${zoom})`, transformOrigin: "50% 30%", opacity: interpolate(stepLocal, [0, 4], [0.55, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
            <div style={{ position: "absolute", right: 12, top: 12, background: NAVY, color: "#fff", fontFamily: MONO, fontSize: 15, padding: "4px 10px", borderRadius: 7, opacity: interpolate(stepLocal, [4, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              {lastStep ? `ANSWER: ${req.judge.verdict}` : shot.action}
            </div>
            <div style={{ position: "absolute", left: 12, top: 12, display: "flex", alignItems: "center", gap: 8, background: "rgba(11,22,38,0.8)", color: "#d6e2f0", fontSize: 14, padding: "3px 9px", borderRadius: 7 }}>
              <JudgeIcon size={16} color="#9fb3cc" /> step {shot.step} of {shot.of}
            </div>
          </div>
          <div style={{ color: "#d6e2f0", padding: "8px 14px", fontSize: tall ? 15 : 16, lineHeight: 1.3, height: tall ? 62 : 66 }}>
            <div style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{shot.thought}</div>
          </div>
        </div>
      </div>
      {/* 4. the checks score */}
      <Arrow x={L.arrowDown2.x} y={L.arrowDown2.y} dir="down" at={tChecks + 2} len={48} />
      <div style={{ position: "absolute", ...L.checks, opacity: checks, transform: `translateY(${(1 - checks) * 16}px)` }}>
        <div style={{ fontSize: 14, color: MUTED, letterSpacing: 1, marginBottom: 4 }}>{req.checks.length} CHECKS ON THE LIVE APP · one after the other</div>
        {checksShown.map((c, k) => {
          const kind = KIND[c.kind] ?? KIND.feature;
          const v = VERDICT[c.verdict] ?? VERDICT.no;
          const done = chipsDone(k);
          const ri = rowIn(k);
          return (
            <div key={k} style={{ display: "flex", gap: 10, alignItems: "center", height: chipRow, fontSize: L.chipFont, opacity: ri, transform: `translateX(${(1 - ri) * 24}px)` }}>
              <div style={{ width: 8, height: chipRow * 0.6, background: kind.color, borderRadius: 2 }} />
              <div style={{ width: tall ? 92 : 104, color: kind.color, fontWeight: 600 }}>{kind.label}</div>
              <div style={{ flex: 1, minWidth: 0, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.task}</div>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: done ? v.color : "#eef2f7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0, fontSize: 16 }}>{done ? v.glyph : ""}</div>
            </div>
          );
        })}
      </div>
      {/* 5. the number lands */}
      <div style={{ position: "absolute", ...L.score, textAlign: "center", color: NAVY, opacity: score, transform: `translate(${(1 - score) * (L.checks.left + L.checks.width / 2 - (L.score.left + L.score.width / 2))}px, ${(1 - score) * (L.checks.top + 60 - L.score.top)}px) scale(${0.35 + 0.65 * score})` }}>
        <div style={{ fontSize: L.scoreSize, fontWeight: 700, lineHeight: 1 }}>{accShown.toFixed(0)}%</div>
        <div style={{ fontSize: tall ? 18 : 22, color: INK, marginTop: 6 }}>
          {req.judge.verdict === "NO" ? "a feature the user asked for is missing: the integration check fails" : "of this request's checks pass"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Requests 1 to 10 as the app's dependency graph, laid out by depth, lighting up in request order,
 * with a schematic of functional QA falling as requests pile up drawn underneath. */
const SCHEMATIC = [94, 92, 89, 84, 76, 66, 57, 51, 47, 45]; // illustrative, not measured: holds up, then falls, then flattens
const Fast: React.FC = () => {
  const f = useCurrentFrame();
  const { tall, W, H } = useTall();
  const n = 10;
  const per = (FAST - S(1.2)) / n;
  const lit = Math.min(n, 1 + Math.floor(f / per));
  const edges = data.dag.edges as { from: number; to: number }[];
  // layered layout: depth = longest path from R1; nodes of one depth share a column
  const depth: number[] = Array(n + 1).fill(0);
  for (let pass = 0; pass < n; pass++) for (const e of edges) depth[e.to] = Math.max(depth[e.to], depth[e.from] + 1);
  const maxD = Math.max(...depth.slice(1));
  const cols: number[][] = Array.from({ length: maxD + 1 }, () => []);
  for (let k = 1; k <= n; k++) cols[depth[k]].push(k);
  const gLeft = tall ? 60 : 120, gRight = W - gLeft;
  const gTop = tall ? 185 : 225, gBottom = tall ? 570 : 610;
  const nodeW = tall ? 96 : 150, nodeH = tall ? 54 : 70;
  const colX = (d: number) => gLeft + nodeW / 2 + (d / maxD) * (gRight - gLeft - nodeW);
  const pos: Record<number, { x: number; y: number }> = {};
  cols.forEach((ks, d) => {
    ks.sort((a, b) => a - b);
    const span = gBottom - gTop;
    ks.forEach((k, i) => {
      pos[k] = { x: colX(d), y: ks.length === 1 ? gTop + span / 2 : gTop + (i / (ks.length - 1)) * span };
    });
  });
  const curveTop = tall ? 680 : 700, curveH = tall ? 260 : 280, curveLeft = gLeft + 50, curveRight = gRight - 10;
  const px = (k: number) => curveLeft + ((k - 1) / (n - 1)) * (curveRight - curveLeft);
  const py = (v: number) => curveTop + curveH - (v / 100) * curveH;
  // the curve is drawn continuously: a fractional position along the polyline, in step with the graph
  const prog = Math.max(0, Math.min(n - 1, ((f - per * 0.5) / (per * (n - 1))) * (n - 1)));
  const whole = Math.floor(prog), frac = prog - whole;
  const at = (k: number) => SCHEMATIC[Math.min(n - 1, k)];
  const tipV = at(whole) + (at(whole + 1) - at(whole)) * frac;
  const tipX = px(whole + 1) + (px(Math.min(n, whole + 2)) - px(whole + 1)) * frac;
  const pts = SCHEMATIC.slice(0, whole + 1).map((v, i) => `${px(i + 1)},${py(v)}`).concat(f > per * 0.5 ? [`${tipX},${py(tipV)}`] : []);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: NAVY }}>
      <div style={{ position: "absolute", left: gLeft, top: tall ? 50 : 60, fontSize: tall ? 38 : 54, fontWeight: 700 }}>… through request 10</div>
      <div style={{ position: "absolute", left: gLeft, top: tall ? 100 : 128, fontSize: tall ? 18 : 22, color: MUTED }}>each request depends on earlier ones: the dependency graph of this app, in request order</div>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={NAVY} /></marker>
          <marker id="ahd" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 z" fill={LINE} /></marker>
        </defs>
        {edges.map((e, i) => {
          const on = e.to <= lit;
          const a = pos[e.from], b = pos[e.to];
          const x1 = a.x + nodeW / 2, x2 = b.x - nodeW / 2 - 3;
          const cx1 = x1 + (x2 - x1) * 0.45, cx2 = x1 + (x2 - x1) * 0.55;
          return <path key={i} d={`M${x1} ${a.y} C ${cx1} ${a.y}, ${cx2} ${b.y}, ${x2} ${b.y}`} fill="none" stroke={on ? NAVY : LINE} strokeWidth={on ? 3 : 1.5} markerEnd={on ? "url(#ah)" : "url(#ahd)"} opacity={on ? 0.9 : 0.8} />;
        })}
        {/* the schematic curve */}
        <line x1={curveLeft} y1={curveTop + curveH} x2={curveRight} y2={curveTop + curveH} stroke={INK} strokeWidth={2} />
        <line x1={curveLeft} y1={curveTop} x2={curveLeft} y2={curveTop + curveH} stroke={INK} strokeWidth={2} />
        <text x={curveLeft - 10} y={curveTop + 8} textAnchor="end" fontSize={tall ? 14 : 16} fill={MUTED} fontFamily={SANS}>high</text>
        <text x={curveLeft - 10} y={curveTop + curveH} textAnchor="end" fontSize={tall ? 14 : 16} fill={MUTED} fontFamily={SANS}>low</text>
        {Array.from({ length: n }, (_, i) => (
          <text key={i} x={px(i + 1)} y={curveTop + curveH + (tall ? 22 : 26)} textAnchor="middle" fontSize={tall ? 15 : 18} fill={i + 1 <= lit ? NAVY : MUTED} fontFamily={SANS} fontWeight={i + 1 <= lit ? 700 : 400}>R{i + 1}</text>
        ))}
        {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke="#c05a5a" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />}
        {SCHEMATIC.slice(0, whole + 1).map((v, i) => <circle key={i} cx={px(i + 1)} cy={py(v)} r={tall ? 6 : 7} fill="#c05a5a" />)}
        {f > per * 0.5 && <circle cx={tipX} cy={py(tipV)} r={tall ? 8 : 9} fill="#c05a5a" opacity={0.9} />}
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const k = i + 1;
        const on = k <= lit;
        const cur = k === lit;
        const pop = spring({ frame: f - (k - 1) * per, fps: FPS, config: { damping: 14, stiffness: 160 } });
        return (
          <div key={k} style={{ position: "absolute", left: pos[k].x - nodeW / 2, top: pos[k].y - nodeH / 2, width: nodeW, height: nodeH, borderRadius: 12, border: `3px solid ${on ? NODE_EDGE[i % 5] : LINE}`, background: on ? NODE_FILL[i % 5] : "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: on ? NAVY : MUTED, transform: `scale(${on ? 0.9 + 0.1 * pop : 1})`, boxShadow: cur ? `0 0 0 6px ${NODE_EDGE[i % 5]}33` : "none" }}>
            <div style={{ fontWeight: 700, fontSize: tall ? 22 : 28, lineHeight: 1 }}>R{k}</div>
            {!tall && <div style={{ fontSize: 12, color: INK, opacity: on ? 1 : 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: nodeW - 12, marginTop: 3 }}>{(data.dag.labels as Record<string, string>)[String(k)]}</div>}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: curveLeft, top: curveTop - (tall ? 40 : 46), fontSize: tall ? 18 : 22, color: INK }}>
        <b>Grade per request</b> <span style={{ color: MUTED }}>· schematic: the deeper the request, the more earlier work it can break</span>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ animate?: boolean }> = ({ animate = true }) => {
  const f = useCurrentFrame();
  // the opening card is fully drawn from frame 0, so the first frame (the thumbnail) is never blank
  const p = animate ? spring({ frame: f, fps: FPS, config: { damping: 200 } }) : 1;
  const icons = animate ? spring({ frame: f - 10, fps: FPS, config: { damping: 200 } }) : 1;
  const { tall } = useTall();
  const ico = tall ? 150 : 170;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: NAVY, justifyContent: "center", alignItems: "center", opacity: p, padding: "0 60px", textAlign: "center" }}>
      <div style={{ fontSize: tall ? 110 : 130, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>EvoWeb</div>
      <div style={{ fontSize: tall ? 28 : 34, color: INK, marginTop: 14 }}>A Benchmark for Coding Agents on Evolving Web Applications</div>
      <div style={{ fontSize: tall ? 22 : 26, color: MUTED, marginTop: 10 }}>How well do coding agents sustain long-horizon follow-up requests?</div>
      <div style={{ display: "flex", gap: tall ? 120 : 160, marginTop: tall ? 70 : 80, opacity: icons, transform: `translateY(${(1 - icons) * 16}px)` }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <GitHubIcon size={ico} />
          <div style={{ fontSize: 24, fontWeight: 600, color: INK }}>code and traces</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <HuggingFaceIcon size={ico} />
          <div style={{ fontSize: 24, fontWeight: 600, color: INK }}>dataset</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Teaser: React.FC<{ results?: boolean; hook?: boolean }> = ({ results = true, hook = true }) => {
  const f = useCurrentFrame();
  const t1 = hook ? HOOK : 0, t2 = t1 + ITER_TOTAL, t3 = t2 + FAST, t4 = t3 + (results ? RESULTS_FRAMES : 0);
  const starts = [t1, t1 + ITER_LENS[0], t1 + ITER_LENS[0] + ITER_LENS[1]];
  const cur = f < t2 ? Math.max(0, starts.findIndex((st, k) => f >= st && f < st + ITER_LENS[k])) : 0;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {hook && f < t1 && <EndCard animate={false} />}
      {f >= t1 && f < t2 && <Shifted from={starts[cur]}><Iteration i={cur} /></Shifted>}
      {f >= t2 && f < t3 && <Shifted from={t2}><Fast /></Shifted>}
      {results && f >= t3 && f < t4 && <Shifted from={t3}><Results /></Shifted>}
      {f >= t4 && <Shifted from={t4}><EndCard /></Shifted>}
    </AbsoluteFill>
  );
};

import { Sequence } from "remotion";
/** Re-bases useCurrentFrame for the child so each part animates from its own zero. */
const Shifted: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => (
  <Sequence from={from} durationInFrames={10_000} layout="none">
    {children}
  </Sequence>
);
