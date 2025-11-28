import React from 'react'

export default function Home({ sets, onCreateClick, onSelectSet, onEditSet, onDeleteSet }) {
    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <h1>Music Sets</h1>
            <p style={{ opacity: 0.7, marginBottom: '3rem' }}>Select a set to start or create a new one.</p>

            <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                marginBottom: '2rem'
            }}>
                {sets.map(set => (
                    <div key={set.id} className="glass" style={{ padding: '2rem', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ marginTop: 0, fontSize: '1.5rem' }}>{set.title}</h2>
                        <p style={{ opacity: 0.6, flex: 1 }}>{set.songs.length} Songs</p>
                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                            <button className="primary" style={{ flex: 2 }} onClick={() => onSelectSet(set.id)}>Open</button>
                            <button onClick={(e) => { e.stopPropagation(); onEditSet(set.id); }} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteSet(set.id); }} style={{ flex: 1, background: 'rgba(255,50,50,0.2)', color: '#ff8888' }}>Delete</button>
                        </div>
                    </div>
                ))}

                <button
                    className="glass"
                    onClick={onCreateClick}
                    style={{
                        padding: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        background: 'rgba(255,255,255,0.02)',
                        minHeight: '200px',
                        color: 'inherit'
                    }}
                >
                    <span style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '1rem' }}>+</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Create New Set</span>
                </button>
            </div>
        </div>
    )
}
