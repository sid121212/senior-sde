'use client'

import { useState } from 'react'
import { phases } from '@/data/design-patterns'
import styles from './page.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy:   '#22c55e',
  Medium: '#f59e0b',
  Hard:   '#ef4444',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignPatternsPage() {
  const [activePhase, setActivePhase]             = useState(0)
  const [expandedPattern, setExpandedPattern]     = useState<string | null>(null)
  const [expandedProblem, setExpandedProblem]     = useState<string | null>(null)
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set())

  const phase = phases[activePhase]

  const toggleProblem = (pid: string) =>
    setExpandedProblem(prev => (prev === pid ? null : pid))

  const toggleComplete = (pid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCompletedProblems(prev => {
      const next = new Set(prev)
      next.has(pid) ? next.delete(pid) : next.add(pid)
      return next
    })
  }

  const totalProblems  = phases.flatMap(p => p.patterns.flatMap(pt => pt.problems)).length
  const completedCount = completedProblems.size
  const progressPct    = Math.round((completedCount / totalProblems) * 100)

  return (
    // Three CSS vars cover every dynamic color on this page
    <div
      className={styles.page}
      style={{
        '--phase-color':   phase.color,
        '--phase-accent':  phase.accent,
        '--progress-pct':  `${progressPct}%`,
      } as React.CSSProperties}
    >

      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <div className={styles.headerMeta}>Senior SWE Interview Prep</div>
            <h1 className={styles.headerTitle}>Design Patterns</h1>
            <div className={styles.headerSource}>
              Based on real Amazon · Google · Flipkart · Uber interview reports (2024–25)
            </div>
          </div>

          <div className={styles.progressBlock}>
            <div className={styles.progressPct}>{progressPct}%</div>
            <div className={styles.progressLabel}>{completedCount}/{totalProblems} problems done</div>
            <div className={styles.progressBarTrack}>
              <div className={styles.progressBarFill} />
            </div>
          </div>
        </div>

        {/* Phase tabs */}
        <div className={styles.phaseTabs}>
          {phases.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePhase(i)
                setExpandedPattern(null)
                setExpandedProblem(null)
              }}
              className={`${styles.phaseTab} ${activePhase === i ? styles.phaseTabActive : ''}`}
              // Each tab has its own accent — set vars only on the active tab
              style={activePhase === i ? { '--tab-color': p.color, '--tab-accent': p.accent } as React.CSSProperties : undefined}
            >
              {p.label} · {p.duration}
            </button>
          ))}
        </div>
      </div>

      {/* ── Phase heading ──────────────────────────────────────────────── */}
      <div className={styles.phaseHeading}>
        <h2 className={styles.phaseTitle}>{phase.title}</h2>
        <span className={styles.phaseSubtitle}>— {phase.subtitle}</span>
      </div>

      {/* ── Pattern list ───────────────────────────────────────────────── */}
      <div className={styles.patternsList}>
        {phase.patterns.map((pattern, pi) => {
          const patternKey    = `${phase.id}-${pi}`
          const isPatternOpen = expandedPattern === patternKey
          const doneCount     = pattern.problems.filter((_, qi) =>
            completedProblems.has(`${patternKey}-${qi}`)
          ).length

          return (
            <div key={patternKey} className={styles.patternItem}>

              {/* Pattern header row */}
              <div
                onClick={() => setExpandedPattern(isPatternOpen ? null : patternKey)}
                className={`${styles.patternRow} ${isPatternOpen ? styles.patternRowOpen : ''}`}
              >
                <span className={styles.patternTag}>{pattern.tag}</span>

                <div className={styles.patternInfo}>
                  <div className={styles.patternNameRow}>
                    <span className={`${styles.patternName} ${isPatternOpen ? styles.patternNameActive : ''}`}>
                      {pattern.name}
                    </span>
                    <span className={styles.patternProgressChip}>
                      {doneCount}/{pattern.problems.length} done
                    </span>
                  </div>
                  <div className={styles.patternConcept}>{pattern.concept}</div>
                </div>

                <div className={styles.patternAsked}>
                  {pattern.asked.slice(0, 3).map(co => (
                    <span key={co} className={styles.companyChip}>{co}</span>
                  ))}
                </div>

                <span className={styles.chevron}>{isPatternOpen ? '▲' : '▼'}</span>
              </div>

              {/* Problem list */}
              {isPatternOpen && (
                <div className={styles.problemsContainer}>
                  {pattern.problems.map((problem, qi) => {
                    const pid        = `${patternKey}-${qi}`
                    const isProbOpen = expandedProblem === pid
                    const isDone     = completedProblems.has(pid)

                    return (
                      <div key={pid} className={styles.problemItem}>

                        {/* Problem row */}
                        <div
                          onClick={() => toggleProblem(pid)}
                          className={`${styles.problemRow} ${isDone ? styles.problemRowDone : ''}`}
                        >
                          <button
                            onClick={(e) => toggleComplete(pid, e)}
                            className={`${styles.checkbox} ${isDone ? styles.checkboxDone : ''}`}
                          >
                            {isDone ? '✓' : ''}
                          </button>

                          <div className={styles.problemContent}>
                            <div className={styles.problemTitleRow}>
                              <span className={`${styles.problemTitle} ${isDone ? styles.problemTitleDone : ''}`}>
                                {problem.title}
                              </span>
                              <span
                                className={styles.difficultyBadge}
                                style={{ color: DIFFICULTY_COLOR[problem.difficulty] }}
                              >
                                {problem.difficulty}
                              </span>
                            </div>
                            <div className={styles.patternTags}>
                              {problem.patterns_used.map(p => (
                                <span key={p} className={styles.patternTagChip}>{p}</span>
                              ))}
                            </div>
                          </div>

                          <div className={styles.problemCompanies}>
                            {problem.companies.slice(0, 2).map(c => (
                              <span key={c} className={styles.problemCompanyTag}>{c}</span>
                            ))}
                          </div>

                          <span className={styles.chevronSmall}>{isProbOpen ? '▲' : '▼'}</span>
                        </div>

                        {/* Expanded detail */}
                        {isProbOpen && (
                          <div className={styles.detailPanel}>

                            <div className={styles.detailSection}>
                              <div className={styles.detailLabel}>What to build</div>
                              <div className={styles.detailText}>{problem.what}</div>
                            </div>

                            <div className={styles.hintBox}>
                              <div className={styles.hintLabel}>Interviewer Hint</div>
                              <div className={styles.hintText}>{problem.hint}</div>
                            </div>

                            {problem.java_sketch ? (
                              <div>
                                <div className={styles.codeLabel}>Java Skeleton (fill in the blanks)</div>
                                <pre className={styles.codePre}>{problem.java_sketch}</pre>
                              </div>
                            ) : (
                              <div className={styles.noSketch}>
                                → Try implementing this one from scratch first. Reference the pattern above.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* ── How-to-use callout ─────────────────────────────────────── */}
        <div className={styles.howToBox}>
          <div className={styles.howToLabel}>How to Use This Plan</div>
          <div className={styles.howToContent}>
            1. <span>Read the pattern concept</span> (GoF book chapter or Refactoring.Guru) — 30 min max<br/>
            2. <span>Code the Easy problem cold</span> — no looking at sketches<br/>
            3. <span>Review skeleton → refactor</span> your solution<br/>
            4. <span>Code the Medium/Hard problem</span> with a 60–90 min timer (simulate machine coding)<br/>
            5. <span>Write in Java</span> — it&apos;s the dominant language in Indian product companies for LLD rounds<br/>
            6. <span>Check the box</span> only when you can explain the pattern choice aloud in 2 sentences
          </div>
        </div>
      </div>
    </div>
  )
}