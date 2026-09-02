import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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

export default function GastoView({ state, setState, quizProgress, onAnswerCorrect, onFirstAttempt, onBack, onNext, onRanking }) {
  const accent = COLORS.teal;
  const { G } = state;
  const chartData = [{ name: "Gasto Público (G)", value: Math.round(G) }];
  return (
    <div>
      <TopBar title="Gasto Público" onBack={onBack} onRanking={onRanking} />
      <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>El Estado decide cuánto gasta — no depende de si recauda más o menos</p>
      <FormulaCard
        accent={accent}
        formula={<><V>G</V> = <Overline><V>G</V></Overline></>}
        legend={[
          { symbol: <Overline><V>G</V></Overline>, desc: "Gasto público autónomo — no depende de ninguna otra variable" },
        ]}
      />
      <ChartBox>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide domain={[0, 8000000]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ backgroundColor: COLORS.bg, border: "none", borderRadius: 8, color: COLORS.textLight }} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} fill={accent} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <BigNumberDisplay label="Presupuesto de gasto público" value={formatCOP(G)} accent={accent} />
      <p className="text-sm mb-5 leading-relaxed" style={{ color: COLORS.textLight }}>
        El Congreso aprobó un gasto de {formatCOP(G)} para este año. Así la economía esté floja o los impuestos no alcancen, el Estado puede seguir gastando — se financia con deuda si es necesario.
      </p>
      <Fader label="Gasto público (G)" value={G} min={0} max={8000000} step={100000} accent={accent} format={formatCOP} onChange={(v) => setState({ G: v })} />
      <QuizBlock questions={QUIZZES.gasto} accent={accent} progress={quizProgress} onAnswerCorrect={onAnswerCorrect} onFirstAttempt={onFirstAttempt} />
      <NextBackRow onBack={onBack} onNext={onNext} accent={accent} />
    </div>
  );
}
