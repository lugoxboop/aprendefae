import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { COLORS } from "../theme.js";
import { QUIZZES } from "../data/quizzes.js";
import { formatCOP } from "../utils/formato.js";
import TopBar from "./shared/TopBar.jsx";
import Fader from "./shared/Fader.jsx";
import BigNumberDisplay from "./shared/BigNumberDisplay.jsx";
import FormulaCard from "./shared/FormulaCard.jsx";
import ChartBox from "./shared/ChartBox.jsx";
import QuizBlock from "./shared/QuizBlock.jsx";
import NextBackRow from "./shared/NextBackRow.jsx";
import { V, Overline } from "./shared/FormulaTokens.jsx";

export default function ConsumoView({ state, setState, quizProgress, onAnswerCorrect, onFirstAttempt, onBack, onNext, onRanking }) {
  const accent = COLORS.blue;
  const { Y, TR, T, c } = state;
  const dispo = Y - T + TR;
  const C = Math.max(0, c * dispo);
  const chartData = [
    { name: "Renta disponible", value: Math.round(dispo) },
    { name: "Consumo", value: Math.round(C) },
  ];
  return (
    <div>
      <TopBar title="Consumo" onBack={onBack} onRanking={onRanking} />
      <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>Consumo = lo que gastas de tu renta</p>
      <FormulaCard
        accent={accent}
        formula={<><V>C</V> = <Overline><V>C</V></Overline> + <V>c</V>(<V>Y</V> + <V>TR</V> − <V>T</V>)</>}
        note="con T = tY"
        legend={[
          { symbol: <Overline><V>C</V></Overline>, desc: "Consumo autónomo" },
          { symbol: <V>c</V>, desc: "Propensión Marginal a Consumir (MPC)" },
          { symbol: <V>Y</V>, desc: "Renta (ingreso)" },
          { symbol: <V>TR</V>, desc: "Transferencias" },
          { symbol: <V>T</V>, desc: "Impuestos directos (T = tY)" },
          { symbol: <V>t</V>, desc: "Tasa impositiva (%)" },
        ]}
      />
      <ChartBox>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ backgroundColor: COLORS.bg, border: "none", borderRadius: 8, color: COLORS.textLight }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              <Cell fill={COLORS.teal} />
              <Cell fill={accent} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <BigNumberDisplay label="Tu consumo total" value={formatCOP(C)} accent={accent} />
      <p className="text-sm mb-5 leading-relaxed" style={{ color: COLORS.textLight }}>
        Tu renta disponible es {formatCOP(dispo)}. Como tu MPC es {c.toFixed(2)}, terminas consumiendo {formatCOP(C)} — el resto ({formatCOP(dispo - C)}) lo ahorras.
      </p>
      <Fader label="Renta (Y)" value={Y} min={0} max={10000000} step={100000} accent={accent} format={formatCOP} onChange={(v) => setState((s) => ({ ...s, Y: v }))} />
      <Fader label="Transferencias (TR)" value={TR} min={0} max={2000000} step={50000} accent={accent} format={formatCOP} onChange={(v) => setState((s) => ({ ...s, TR: v }))} />
      <Fader label="Impuestos (T)" value={T} min={0} max={1000000} step={25000} accent={accent} format={formatCOP} onChange={(v) => setState((s) => ({ ...s, T: v }))} />
      <Fader label="Propensión marginal a consumir (c)" value={c} min={0.3} max={0.9} step={0.05} accent={accent} format={(v) => v.toFixed(2)} onChange={(v) => setState((s) => ({ ...s, c: v }))} />
      <QuizBlock questions={QUIZZES.consumo} accent={accent} progress={quizProgress} onAnswerCorrect={onAnswerCorrect} onFirstAttempt={onFirstAttempt} />
      <NextBackRow onBack={onBack} onNext={onNext} accent={accent} />
    </div>
  );
}
