import React, { useState } from 'react'

export default function SetCreator({ onSave, onCancel, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '')
    const [songs, setSongs] = useState(initialData?.songs || [])

    // Temporary state for new song
    const [currentSong, setCurrentSong] = useState({ title: '', lyrics: '', color: '#ffffff' })

    const addSong = () => {
        if (!currentSong.title) return
        setSongs([...songs, { ...currentSong, id: Date.now().toString() }])
        setCurrentSong({ title: '', lyrics: '', color: '#ffffff' })
    }

    const removeSong = (index) => {
        setSongs(songs.filter((_, i) => i !== index))
    }

    const handleSave = () => {
        if (!title) return alert('Please enter a set title')

        if (currentSong.title || currentSong.lyrics) {
            if (confirm('You have an unsaved song in the "Add Song" form. Do you want to add it to the set before saving?')) {
                const newSong = { ...currentSong, id: Date.now().toString() }
                onSave({ title, songs: [...songs, newSong] })
                return
            }
        }

        onSave({ title, songs })
    }

    return (
        <div className="animate-fade-in" style={{ width: '100%', textAlign: 'left', paddingBottom: '100px' }}>
            <button onClick={onCancel} style={{ marginBottom: '1rem', background: 'transparent', paddingLeft: 0 }}>← Back to Home</button>
            <h1>{initialData ? 'Edit Set' : 'Create New Set'}</h1>

            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Set Title</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Wedding Ceremony"
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Song Form */}
                <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0 }}>Add Song</h3>

                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Song Title</label>
                    <input
                        value={currentSong.title}
                        onChange={e => setCurrentSong({ ...currentSong, title: e.target.value })}
                        placeholder="Song Name"
                    />

                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Lyrics</label>
                    <textarea
                        value={currentSong.lyrics}
                        onChange={e => setCurrentSong({ ...currentSong, lyrics: e.target.value })}
                        placeholder="Paste lyrics here..."
                        rows={10}
                        style={{ fontFamily: 'monospace', lineHeight: '1.4' }}
                    />

                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>Card Color Theme</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        {[
                            { c: '#ffffff', n: 'White' },
                            { c: '#ffcccc', n: 'Red' },
                            { c: '#ccffcc', n: 'Green' },
                            { c: '#ccccff', n: 'Blue' },
                            { c: '#ffffcc', n: 'Yellow' },
                            { c: '#ffccff', n: 'Pink' },
                            { c: '#ccffff', n: 'Cyan' },
                            { c: '#ffd8a8', n: 'Orange' }
                        ].map(({ c }) => (
                            <div
                                key={c}
                                onClick={() => setCurrentSong({ ...currentSong, color: c })}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: c,
                                    cursor: 'pointer',
                                    border: currentSong.color === c ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: currentSong.color === c ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        ))}
                    </div>

                    <button className="primary" onClick={addSong} style={{ width: '100%' }}>Add Song to Set</button>
                </div>

                {/* List */}
                <div>
                    <h3 style={{ marginTop: 0 }}>Songs in Set ({songs.length})</h3>
                    {songs.length === 0 && (
                        <div style={{ padding: '2rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '10px', textAlign: 'center', opacity: 0.5 }}>
                            No songs added yet. Use the form to add songs.
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {songs.map((song, idx) => (
                            <div key={song.id} className="glass" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(90deg, ${song.color}11, transparent)` }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>{idx + 1}</span>
                                        <strong>{song.title}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.8em', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '34px' }}>
                                        {song.lyrics.substring(0, 40)}...
                                    </div>
                                </div>
                                <button onClick={() => removeSong(idx)} style={{ padding: '0.4em 0.8em', background: 'rgba(255,50,50,0.2)', color: '#ff8888', border: 'none' }}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <button className="primary" onClick={handleSave} style={{ fontSize: '1.2rem', padding: '1rem 4rem' }}>Save Set</button>
            </div>
        </div>
    )
}
