import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import styles from "./page.module.css";

const productLines = [
  {
    title: "Socratic Tutor",
    body:
      "Ground every interaction in class material, lead with questions, and help students think instead of shortcutting the work.",
  },
  {
    title: "Writing Portal",
    body:
      "Generate writing that matches a student's real voice and teacher rubric through deliberate multi-pass drafting.",
  },
  {
    title: "Teacher Workspace",
    body:
      "Give teachers a real control surface for materials, class context, and visibility into where students are getting stuck.",
  },
];

const stackDecisions = [
  "Next.js 16.2.4 App Router on React 19.2.x",
  "Convex as the realtime backend and application database",
  "Turborepo + Bun workspaces for monorepo structure and task orchestration",
  "Vercel as the default deployment target for the web app",
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Paideia rebuild</p>
          <h1>
            An AI learning product that protects thinking and preserves voice.
          </h1>
          <p className={styles.lede}>
            We are rebuilding Paideia around three tightly connected surfaces:
            a grounded Socratic tutor, a voice-matched writing portal, and a
            teacher workspace that supplies the context both of those systems
            depend on.
          </p>
          <div className={styles.pills}>
            {stackDecisions.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className={styles.actions}>
            {userId ? (
              <>
                <Link href="/dashboard" className={styles.primaryAction}>
                  Open dashboard
                </Link>
                <Link href="/auth" className={styles.secondaryAction}>
                  Manage session
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" className={styles.primaryAction}>
                  Create account or sign in
                </Link>
                <Link href="/auth" className={styles.secondaryAction}>
                  Open auth
                </Link>
              </>
            )}
          </div>
        </section>

        <section className={styles.grid}>
          {productLines.map((line) => (
            <article key={line.title} className={styles.card}>
              <p className={styles.cardLabel}>Core product</p>
              <h2>{line.title}</h2>
              <p>{line.body}</p>
            </article>
          ))}
        </section>

        <section className={styles.columns}>
          <article className={styles.panel}>
            <p className={styles.panelLabel}>Rebuild principles</p>
            <ul>
              <li>Tutor responses stay grounded in student or teacher materials.</li>
              <li>Writing output must sound like the student, not a generic AI.</li>
              <li>Teachers remain first-class participants, not passive observers.</li>
            </ul>
          </article>

          <article className={styles.panel}>
            <p className={styles.panelLabel}>Current focus</p>
            <ul>
              <li>Set the monorepo baseline with current Next.js, Convex, and Vercel conventions.</li>
              <li>Capture stack decisions in living docs before the rebuild accelerates.</li>
              <li>Keep auth, payments, and long-term data model choices explicit and reversible.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
