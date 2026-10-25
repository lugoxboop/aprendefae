import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TEAL NO ES COLOR DE TEXTO (Levi, al ver juntos #573 y #580).
 *
 * El teal #2A9D8F como texto sobre las superficies oscuras de la plataforma no
 * llega a 4,5:1: medido con scripts/ranking/medir.mjs, 2,78 a 3,72 sobre el
 * navy y 4,21 a 4,43 sobre #1F2D3D y #1C2939. Falló en el podio, el ranking,
 * el ánimo y el Cierre: no son cuatro hallazgos, es un token mal usado.
 *
 * La regla: teal en contornos, rellenos de botón (con texto #06202A encima),
 * flechas e iconos; NUNCA como `color` de un texto.
 *
 * ═══════════ EL TRINQUETE ═══════════
 *
 * Hoy hay 87 sitios en 60 archivos (inventario del 25-oct sobre main). Cada
 * uno es de quien tiene el archivo. Esta lista solo puede ENCOGER: un archivo
 * nuevo con `color: FAE.teal` o un sitio más en uno de la lista lo pone rojo.
 * Quien arregle el suyo borra o baja su número aquí en el mismo PR.
 * Macroeconomía y Pensamiento Estratégico tienen estudiantes: sus sitios quedan
 * anotados y se corrigen solo cuando su dueño los toque.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const PATRON = /(?<![a-zA-Z-])color:\s*(?:FAE\.teal\b|"#2A9D8F"|#2A9D8F\b|\$\{FAE\.teal\})/gi;

const PENDIENTES = {
  "src/components/DemandaAgregadaAprenderView.jsx": 2,
  "src/components/IcebergView.jsx": 1,
  "src/components/PensamientoSistemicoView.jsx": 1,
  "src/components/PerfilView.jsx": 4,
  "src/components/PoliticaEconomicaView.jsx": 1,
  "src/components/PoliticaFiscalView.jsx": 1,
  "src/components/PoliticaMonetariaView.jsx": 1,
  "src/components/PorterView.jsx": 2,
  "src/components/backgrounds/MeshGradientBackground.jsx": 1,
  "src/components/docente/CabeceraResumen.jsx": 1,
  "src/components/docente/FilaEstudiante.jsx": 1,
  "src/components/docente/MarcaNivel.jsx": 2,
  "src/components/ligas/CabeceraLiga.jsx": 1,
  "src/components/ligas/LigaBoard.jsx": 2,
  "src/components/mecanicas/ArmaGrupoLogico.jsx": 2,
  "src/components/mecanicas/ArquitectoProfundidades.jsx": 3,
  "src/components/mecanicas/AsedioEstrategico.jsx": 1,
  "src/components/mecanicas/CamaraPresion.jsx": 2,
  "src/components/mecanicas/DashboardEconomico.jsx": 1,
  "src/components/mecanicas/DiagnosticoEnVivo.jsx": 1,
  "src/components/mecanicas/ExpedienteRescate.jsx": 1,
  "src/components/mecanicas/ExplicaLaPolitica.jsx": 3,
  "src/components/mecanicas/InmersionDoble.jsx": 3,
  "src/components/mecanicas/MapaCausal.jsx": 1,
  "src/components/mecanicas/QuienGanaQuienPierde.jsx": 2,
  "src/components/mecanicas/RadarProfundidad.jsx": 1,
  "src/components/mecanicas/SimuladorDeCrisis.jsx": 1,
  "src/components/mecanicas/TableroDeDecisiones.jsx": 1,
  "src/components/mecanicas/TransmisionSuperficie.jsx": 2,
  "src/components/mecanicas/TribunalProfundidad.jsx": 3,
  "src/components/mecanicas/arca/EtapaExpediente.jsx": 1,
  "src/components/mecanicas/arca/EtapaIcebergArca.jsx": 1,
  "src/components/mecanicas/arca/ProyectoArca.jsx": 1,
  "src/components/mecanicas/bloques/Memorama.jsx": 1,
  "src/components/mecanicas/bloques/SeAcercaOSeAleja.jsx": 1,
  "src/components/mecanicas/corazon/BancoTransfusiones.jsx": 2,
  "src/components/mecanicas/corazon/PulsoMemoria.jsx": 2,
  "src/components/mecanicas/corazon/juego.jsx": 1,
  "src/components/mecanicas/libros/SeisCuentasAbiertas.jsx": 1,
  "src/components/mecanicas/libros/ciclo/ElCicloCompleto.jsx": 2,
  "src/components/mecanicas/libros/escenas.jsx": 1,
  "src/components/mecanicas/maquinas/CasillasEnOrden.jsx": 1,
  "src/components/mecanicas/maquinas/CuatroCapas.jsx": 1,
  "src/components/mecanicas/nova/ComiteNova.jsx": 1,
  "src/components/mecanicas/nova/EstadoResultados.jsx": 2,
  "src/components/mecanicas/nova/EtapaComite.jsx": 1,
  "src/components/mecanicas/nova/EtapaComunicados.jsx": 1,
  "src/components/mecanicas/nova/EtapaIncidencia.jsx": 1,
  "src/components/mecanicas/nova/EtapaLinea.jsx": 1,
  "src/components/perfil/EditarPerfil.jsx": 1,
  "src/components/perfil/SeccionAvatar.jsx": 1,
  "src/components/ranking/RankingFP.jsx": 1,
  "src/components/repaso/BannerRepaso.jsx": 2,
  "src/components/repaso/PartidaRepaso.jsx": 2,
  "src/components/shared/EnlaceRendimiento.jsx": 1,
  "src/components/shared/VideoYouTube.jsx": 1,
  "src/components/tienda/TiendaView.jsx": 3,
  "src/data/corazonDA.js": 1,
  "src/data/politicaEconomica.js": 1,
  "src/docente/bandas.js": 1,
};

const RAIZ = new URL("../../../../", import.meta.url);
function fuentes(dir, fuera = []) {
  for (const f of readdirSync(new URL(dir, RAIZ))) {
    const ruta = `${dir}${f}`;
    if (f === "__tests__" || f === "node_modules") continue;
    if (statSync(new URL(ruta, RAIZ)).isDirectory()) fuentes(`${ruta}/`, fuera);
    else if (/\.(jsx|js)$/.test(f)) fuera.push(ruta);
  }
  return fuera;
}

test("★★★ ningún texto nuevo en teal (trinquete de toda la plataforma)", () => {
  const archivos = fuentes("src/");
  assert.ok(archivos.length > 200, `se leyeron ${archivos.length} archivos: la prueba habría pasado mirando casi nada`);
  const reproches = [];
  for (const ruta of archivos) {
    const n = (readFileSync(new URL(ruta, RAIZ), "utf8").match(PATRON) ?? []).length;
    const permitidos = PENDIENTES[ruta] ?? 0;
    if (n > permitidos) reproches.push(`${ruta}: ${n} texto(s) en teal (permitidos ${permitidos}). El teal va en contornos, rellenos e iconos; el texto, en FAE.text o #A8B6C8.`);
  }
  assert.deepEqual(reproches, []);
});
