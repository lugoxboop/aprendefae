// En la nube de Claude hay un Chromium preinstalado; en GitHub Actions, Remotion usa el suyo.
import fs from "node:fs";
const LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
export const exe = process.env.BROWSER_EXE || (fs.existsSync(LOCAL) ? LOCAL : null);
