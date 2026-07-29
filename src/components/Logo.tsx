import { site } from "@/config/site";
import styles from "./Logo.module.css";

/**
 * The brand mark: a leaf drawn as two mirrored arcs, a centre stem, and two
 * short branches. The full version carries the ochre branches and an 18%
 * ochre wash inside the leaf; the `muted` variant drops both and renders
 * leaf + stem in a single colour (used in the footer).
 */
export function LogoMark({
  size = 26,
  muted = false,
}: {
  size?: number;
  muted?: boolean;
}) {
  const stroke = muted ? "var(--text-quiet-dark)" : "var(--ink)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 2.5C23.2 10 23.2 22 16 29.5C8.8 22 8.8 10 16 2.5Z"
        stroke={stroke}
        strokeWidth="1.6"
        fill={muted ? "none" : "var(--accent)"}
        fillOpacity={muted ? undefined : 0.18}
      />
      <path d="M16 7.5V24.5" stroke={stroke} strokeWidth="1.6" />
      {!muted && (
        <>
          <path d="M16 14.5L21 11" stroke="var(--accent)" strokeWidth="1.6" />
          <path d="M16 19.5L11 16" stroke="var(--accent)" strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}

/** Mark plus wordmark and descriptor, side by side. */
export function Logo() {
  return (
    <a href="#top" className={styles.lockup} aria-label={`${site.legalName} — back to top`}>
      <LogoMark size={26} />
      <span className={styles.text}>
        <span className={styles.wordmark}>{site.shortName}</span>
        <span className={styles.descriptor}>{site.descriptor}</span>
      </span>
    </a>
  );
}
