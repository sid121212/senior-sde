'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { dsaPhases } from '@/data/dsa'
import { useAuth } from '@/context/AuthContext'
import { loadProgress, saveProgress } from '@/lib/progress'
import LoadingScreen from '@/components/LoadingScreen'
import styles from './page.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy:   '#22c55e',
  Medium: '#f59e0b',
  Hard:   '#ef4444',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DSAPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activePhase, setActivePhase]             = useState(0)
  const [expandedPattern, setExpandedPattern]     = useState<string | null>(null)
  const [expandedProblem, setExpandedProblem]     = useState<string | null>(null)
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set())

  // Protect the route
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Load progress from database on mount or user change
  useEffect(() => {
    if (user) {
      loadProgress(user.uid, 'dsa').then((set) => {
        setCompletedProblems(set)
      })
    }
  }, [user])

  const phase = dsaPhases[activePhase]

  const togglePattern = (name: string) => {
    setExpandedPattern(prev => (prev === name ? null : name))
    setExpandedProblem(null)
  }

  const toggleProblem = (title: string) => {
    setExpandedProblem(prev => (prev === title ? null : title))
  }

  const toggleComplete = async (title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return

    setCompletedProblems(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      // Save updated progress back to Firestore/local DB
      saveProgress(user.uid, 'dsa', next)
      return next
    })
  }

  const totalProblems  = dsaPhases.flatMap(p => p.patterns.flatMap(pt => pt.problems)).length
  const completedCount = completedProblems.size
  const progressPct    = Math.round((completedCount / totalProblems) * 100)

  if (loading || !user) {
    return <LoadingScreen />
  }

  return (
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
            <h1 className={styles.headerTitle}>DSA Patterns</h1>
            <div className={styles.headerSource}>
              Based on NeetCode 150, Blind 75, and real Google · Amazon · Uber reports (2024–25)
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
          {dsaPhases.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePhase(i)
                setExpandedPattern(null)
                setExpandedProblem(null)
              }}
              className={`${styles.phaseTab} ${activePhase === i ? styles.phaseTabActive : ''}`}
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
          const isOpen             = expandedPattern === pattern.name
          const completedInPattern = pattern.problems.filter(p => completedProblems.has(p.title)).length
          const totalInPattern     = pattern.problems.length

          return (
            <div key={pi} className={styles.patternItem}>
              {/* Pattern Header Row */}
              <div
                onClick={() => togglePattern(pattern.name)}
                className={`${styles.patternRow} ${isOpen ? styles.patternRowOpen : ''}`}
              >
                <span className={styles.patternTag}>{pattern.tag}</span>
                
                <div className={styles.patternInfo}>
                  <div className={styles.patternNameRow}>
                    <span className={`${styles.patternName} ${isOpen ? styles.patternNameActive : ''}`}>
                      {pattern.name}
                    </span>
                    <span className={styles.patternProgressChip}>
                      {completedInPattern}/{totalInPattern} done
                    </span>
                    <span className={styles.patternFrequency}>
                      {pattern.frequency}
                    </span>
                  </div>
                  <div className={styles.patternConcept}>
                    {pattern.concept}
                  </div>
                </div>

                <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Pattern Detail & Problems list */}
              {isOpen && (
                <div>
                  {/* Pattern Details Panel */}
                  <div className={styles.patternDetailBlock}>
                    <div className={styles.whenToUseBox}>
                      <div className={styles.whenToUseLabel}>When to Recognize:</div>
                      <div className={styles.whenToUseText}>{pattern.when_to_use}</div>
                    </div>
                  </div>

                  {/* Problems list */}
                  <div className={styles.problemsContainer}>
                    {pattern.problems.map((problem, pri) => {
                      const isProblemOpen = expandedProblem === problem.title
                      const isDone        = completedProblems.has(problem.title)

                      return (
                        <div key={pri} className={styles.problemItem}>
                          {/* Problem header */}
                          <div
                            onClick={() => toggleProblem(problem.title)}
                            className={`${styles.problemRow} ${isDone ? styles.problemRowDone : ''}`}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={(e) => toggleComplete(problem.title, e)}
                              className={`${styles.checkbox} ${isDone ? styles.checkboxDone : ''}`}
                              title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                            >
                              {isDone && '✓'}
                            </button>

                            {/* Title & tags */}
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

                                <a
                                  href={problem.leetcode}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.leetcodeLink}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  #{problem.lcNumber} ↗
                                </a>
                              </div>

                              <div className={styles.patternTags}>
                                {problem.pattern_tag.map((pt, pti) => (
                                  <span key={pti} className={styles.patternTagChip}>
                                    {pt}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Companies list */}
                            <div className={styles.problemCompanies}>
                              {problem.companies.map((company, ci) => (
                                <span key={ci} className={styles.problemCompanyTag}>
                                  {company}
                                </span>
                              ))}
                            </div>

                            <span className={styles.chevronSmall}>
                              {isProblemOpen ? '▲' : '▼'}
                            </span>
                          </div>

                          {/* Problem Details */}
                          {isProblemOpen && (
                            <div className={styles.detailPanel}>
                              {/* What it tests */}
                              <div className={styles.detailSection}>
                                <div className={styles.detailLabel}>What It Tests / Focus</div>
                                <div className={styles.detailText}>{problem.what}</div>
                              </div>

                              {/* Key Insight / Hint */}
                              <div className={styles.hintBox}>
                                <div className={styles.hintLabel}>Key Insight</div>
                                <div className={styles.hintText}>{problem.hint}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
