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
import { V } from "./shared/FormulaTokens.jsx";
import PanelVisual from "./mecanicas/visuales/PanelVisual.jsx";
import BalanzaComercial from "./mecanicas/visuales/BalanzaComercial.jsx";

export default function XNView({ state, setState, quizProgress, onAnswerCorrect, onFirstAttempt, onBack, onNext }) {
  const accent = COLORS.gold;
  const { tc } = state;
  const X0 = 3000000, M0 = 3000000, k = 300, tcMid = 4000;
  const X = Math.max(0, X0 + k * (tc - tcMid));
  const M = Math.max(0, M0 - k * (tc - tcMid));
  const XN = X - M;
  const chartData = [
    { name: "Exportaciones (X)", value: Math.round(X) },
    { name: "Importaciones (M)", value: Math.round(M) },
  ];
  return (
    <div>
      <TopBar title="Exportaciones Netas" onBack={onBack} />
      <p className="text-sm mb-4" style={{ color: COLORS.textMuted }}>XN = lo que vendemos afuera menos lo que compramos afuera</p>
      <FormulaCard
        accent={accent}
        formula={<><V>XN</V> = <V>X</V> − <V>M</V> = <V>f</V>(<V>tc</V>)</>}
        legend={[
          { symbol: <V>tc</V>, desc: "Tipo de cambio" },
        ]}
      />
      <ChartBox>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => formatCOP(v)} contentStyle={{ backgroundColor: COLORS.bg, border: "none", borderRadius: 8, color: COLORS.textLight }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              <Cell fill={COLORS.blue} />
              <Cell fill={accent} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      {/*
        La inclinación se normaliza contra el desbalance máximo que alcanza el
        fader (600.000 en cada extremo del rango 2000–6000), así que los topes
        del slider corresponden a los topes del ladeo.
      */}
      <PanelVisual pie="La balanza se inclina hacia el lado que pesa más">
        <BalanzaComercial inclinacion={XN / (k * (6000 - tcMid))} accent={accent} teal={COLORS.teal} coral={COLORS.red} />
      </PanelVisual>
      <BigNumberDisplay
        label="Exportaciones netas (XN)"
        value={formatCOP(XN)}
        accent={accent}
        sub={XN >= 0 ? "Colombia vende más de lo que compra afuera" : "Colombia compra más de lo que vende afuera"}
      />
      <p className="text-sm mb-5 leading-relaxed" style={{ color: COLORS.textLight }}>
        Con el dólar a {formatCOP(tc)} por dólar, tus exportaciones valen {formatCOP(X)} y tus importaciones {formatCOP(M)}.{" "}
        {tc > tcMid ? "Un dólar caro favorece a quien exporta y encarece lo que se trae de afuera." : tc < tcMid ? "Un dólar barato favorece a quien importa, pero le pega a quien exporta." : "Estás en el punto de equilibrio cambiario."}
      </p>
      <Fader label="Tipo de cambio (TRM)" value={tc} min={2000} max={6000} step={50} accent={accent} format={(v) => formatCOP(v) + "/USD"} onChange={(v) => setState({ tc: v })} />
      <QuizBlock questions={QUIZZES.xn} accent={accent} progress={quizProgress} onAnswerCorrect={onAnswerCorrect} onFirstAttempt={onFirstAttempt} />
      <NextBackRow onBack={onBack} onNext={onNext} accent={accent} pendientes={quizProgress.filter((v) => !v).length} />
    </div>
  );
}
