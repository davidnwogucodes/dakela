import { getSettings } from "@/lib/content";
import { themeCss } from "@/lib/theme";

/**
 * Emits the owner's chosen palette as custom-property overrides.
 *
 * Rendered on the public pages only, never in the dashboard: a badly chosen
 * accent should not be able to make the screen where you fix it unreadable.
 *
 * The CSS is generated from validated hex values in themeCss — no settings
 * string reaches the stylesheet directly.
 */
export async function ThemeStyle() {
  const settings = await getSettings();
  const css = themeCss(settings.theme_preset, settings.accent);

  return <style id="dakela-theme">{css}</style>;
}
