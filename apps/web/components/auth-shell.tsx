import type { ReactNode } from "react";
import styles from "./auth-shell.module.css";

export function AuthShell({
  label,
  title,
  body,
  children,
}: {
  label: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <div className={styles.intro}>
          <p className={styles.label}>{label}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.body}>{body}</p>
          <ul className={styles.points}>
            <li>Students get a guided tutor instead of an answer machine.</li>
            <li>Writing support stays tied to voice and teacher expectations.</li>
            <li>Teachers stay in the loop through class context and materials.</li>
          </ul>
        </div>
        <div className={styles.content}>{children}</div>
      </section>
    </main>
  );
}
