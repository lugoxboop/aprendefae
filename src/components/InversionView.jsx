import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
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

export default function InversionView({ state, setState, quizProgress, onAnswerCorrect, onFirstAttempt, onBack, onNext, onRanking }) {
  const accent = COLORS.orange;
  const { Ibar, b, i } = state;
  const I = Math.max(0, Ibar - b * i);
  const curveData = [];
  for (let iv = 1; iv <= 30; iv++) curveData.push({ i: iv, I: Math.max(0, Ibar - b * iv) });
  return (
    <div>
      <TopBar title="Inversión" onBack={onBack} onRanking={onRanking} />
      <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>Inversión = confianza de los empresarios + qué tan cara está pedir prestado</p>
      <FormulaCard
        accent={accent}
        formula={<><V>I</V> = <Overline><V>I</V></Overline> − <V>b</V><V>i</V></>}
        legend={[
          { symbol: <Overline><V>I</V></Overline>, desc: "Inversión autónoma" },
          { symbol: <V>b</V>, desc: "Elasticidad interés de la inversión (sensibilidad)" },
          { symbol: <V>i</V>, desc: "Tasa de interés" },
        ]}
      />
      <ChartBox>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="i"
              tick={{ fill: COLORS.textMuted, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Tasa de interés (%)", position: "insideBottom", offset: -2, style: { fill: COLORS.textMuted, fontSize: 10 } }}
            />
            <YAxis hide />
            <Tooltip formatter={(v) => formatCOP(v)} labelFormatter={(l) => `i = ${l}%`} contentStyle={{ backgroundColor: COLORS.bg, border: "none", borderRadius: 8, color: COLORS.textLight }} />
            <Line type="monotone" dataKey="I" stroke={accent} strokeWidth={3} dot={false} />
            <ReferenceDot x={i} y={I} r={6} fill={accent} stroke={COLORS.bg} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
      <BigNumberDisplay label="Tu inversión total" value={formatCOP(I)} accent={accent} />
      <p className="text-sm mb-5 leading-relaxed" style={{ color: COLORS.textLight }}>
        Con una tasa de interés del {i}%, tu inversión es {formatCOP(I)}. Si el Banco de la República sube la tasa, pedir crédito se encarece y inviertes menos — pero tu confianza en el negocio ({formatCOP(Ibar)} de inversión autónoma) no desaparece.
      </p>
      <Fader label="Inversión autónoma (Ī)" value={Ibar} min={0} max={5000000} step={100000} accent={accent} format={formatCOP} onChange={(v) => setState((s) => ({ ...s, Ibar: v }))} />
      <Fader label="Sensibilidad a la tasa (b)" value={b} min={0} max={200000} step={5000} accent={accent} format={formatCOP} onChange={(v) => setState((s) => ({ ...s, b: v }))} />
      <Fader label="Tasa de interés (i)" value={i} min={1} max={30} step={1} accent={accent} format={(v) => v + "%"} onChange={(v) => setState((s) => ({ ...s, i: v }))} />
      <QuizBlock questions={QUIZZES.inversion} accent={accent} progress={quizProgress} onAnswerCorrect={onAnswerCorrect} onFirstAttempt={onFirstAttempt} />
      <NextBackRow onBack={onBack} onNext={onNext} accent={accent} />
    </div>
  );
}
