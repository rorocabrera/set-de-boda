import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function SetViewer({ set, onExit }) {
    const [activeSongIndex, setActiveSongIndex] = useState(null)

    // Scroll to top when song changes
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [activeSongIndex])

    const activeSong = activeSongIndex !== null ? set.songs[activeSongIndex] : null

    const handleNext = () => {
        if (activeSongIndex !== null && activeSongIndex < set.songs.length - 1) {
            setActiveSongIndex(activeSongIndex + 1)
        }
    }

    const handlePrev = () => {
        if (activeSongIndex !== null && activeSongIndex > 0) {
            setActiveSongIndex(activeSongIndex - 1)
        }
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', paddingBottom: activeSong ? '0' : '50px' }}>
            <div className="animate-fade-in">
                {/* Back Navigation */}
                {!activeSong && (
                    <button
                        onClick={onExit}
                        style={{
                            background: 'transparent',
                            paddingLeft: 0,
                            marginBottom: '1rem',
                            fontSize: '1rem'
                        }}
                    >
                        ← Back to Sets
                    </button>
                )}

                {/* Navigation Header */}
                <div
                    onClick={() => setActiveSongIndex(null)}
                    style={{
                        cursor: activeSong ? 'pointer' : 'default',
                        transition: 'all 0.5s ease',
                        marginBottom: activeSong ? '1rem' : '3rem',
                        position: activeSong ? 'sticky' : 'relative',
                        top: 0,
                        background: activeSong ? 'var(--bg-color)' : 'transparent',
                        zIndex: 100,
                        padding: activeSong ? '1rem 0' : '0',
                        borderBottom: activeSong ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    {activeSong && (
                        <div style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>← Tap title for song list</span>
                        </div>
                    )}
                    <h1 style={{
                        fontSize: activeSong ? '1.5rem' : '3.5rem',
                        margin: 0,
                        cursor: activeSong ? 'pointer' : 'default',
                        lineHeight: 1.2
                    }}>
                        {set.title}
                    </h1>
                </div>

                {/* Song List View */}
                {!activeSong && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                        {set.songs.map((song, idx) => (
                            <div
                                key={song.id}
                                className="glass"
                                onClick={() => setActiveSongIndex(idx)}
                                style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    background: `linear-gradient(90deg, ${song.color}22, rgba(255,255,255,0.05))`,
                                    borderLeft: `4px solid ${song.color}`,
                                    transition: 'transform 0.2s, background 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)'
                                    e.currentTarget.style.background = `linear-gradient(90deg, ${song.color}44, rgba(255,255,255,0.1))`
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                    e.currentTarget.style.background = `linear-gradient(90deg, ${song.color}22, rgba(255,255,255,0.05))`
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ opacity: 0.5, fontSize: '0.9em', width: '20px' }}>{idx + 1}</span>
                                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{song.title}</h3>
                                </div>
                                <span style={{ opacity: 0.3 }}>›</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Lyrics View */}
                {activeSong && (
                    <div className="animate-fade-in" style={{
                        background: 'white',
                        color: 'black',
                        borderRadius: '20px',
                        padding: '2rem',
                        minHeight: '70vh',
                        position: 'relative',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}>
                        <h2 style={{ color: '#333', marginTop: 0, fontSize: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
                            {activeSong.title}
                        </h2>

                        <div style={{
                            fontSize: '1.8rem',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            paddingBottom: '6rem', // Space for nav
                            fontFamily: 'Georgia, serif'
                        }}>
                            {activeSong.lyrics}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Controls */}
            {activeSong && createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    display: 'flex',
                    gap: '15px',
                    zIndex: 99999,
                    pointerEvents: 'none' // Let clicks pass through the container
                }}>
                    {activeSongIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#222', color: 'white', fontSize: '1.8rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid white',
                                cursor: 'pointer',
                                pointerEvents: 'auto' // Re-enable clicks for buttons
                            }}
                            title="Previous Song"
                        >
                            ←
                        </button>
                    )}

                    {activeSongIndex < set.songs.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                background: '#222', color: 'white', fontSize: '1.8rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid white',
                                cursor: 'pointer',
                                pointerEvents: 'auto' // Re-enable clicks for buttons
                            }}
                            title="Next Song"
                        >
                            →
                        </button>
                    )}
                </div>,
                document.body
            )}
        </div>
    )
}
