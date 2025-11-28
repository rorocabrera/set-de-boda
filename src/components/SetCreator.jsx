import React, { useState, useEffect, useRef } from 'react'

function EditSongCard({ song, index, onSave, onCancel }) {
    const [editedSong, setEditedSong] = useState({ ...song })

    const handleSave = () => {
        if (!editedSong.title) return alert('Song title is required')
        onSave(index, editedSong)
    }

    return (
        <div className="glass" style={{ padding: '1.5rem', background: `linear-gradient(135deg, ${editedSong.color}22, transparent)` }}>
            <h4 style={{ marginTop: 0, marginBottom: '1rem', opacity: 0.8 }}>Editing Song #{index + 1}</h4>

            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9em' }}>Song Title</label>
            <input
                value={editedSong.title}
                onChange={e => setEditedSong({ ...editedSong, title: e.target.value })}
                placeholder="Song Name"
                style={{ marginBottom: '1rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9em' }}>Lyrics</label>
            <textarea
                value={editedSong.lyrics}
                onChange={e => setEditedSong({ ...editedSong, lyrics: e.target.value })}
                placeholder="Paste lyrics here..."
                rows={8}
                style={{ fontFamily: 'monospace', lineHeight: '1.4', marginBottom: '1rem' }}
            />

            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9em' }}>Card Color Theme</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
                        onClick={() => setEditedSong({ ...editedSong, color: c })}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: c,
                            cursor: 'pointer',
                            border: editedSong.color === c ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                            boxShadow: editedSong.color === c ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="primary" onClick={handleSave} style={{ flex: 1 }}>Save Changes</button>
                <button onClick={onCancel} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
            </div>
        </div>
    )
}

export default function SetCreator({ onSave, onCancel, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '')
    const [songs, setSongs] = useState(initialData?.songs || [])

    // Temporary state for new song
    const [currentSong, setCurrentSong] = useState({ title: '', lyrics: '', color: '#ffffff' })

    // State for editing existing songs
    const [editingIndex, setEditingIndex] = useState(null)

    // State for drag and drop
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [touchStartY, setTouchStartY] = useState(null)
    const [touchCurrentY, setTouchCurrentY] = useState(null)
    const [isDragging, setIsDragging] = useState(false)

    // Auto-save functionality
    const isInitialMount = useRef(true)
    const autoSaveTimeoutRef = useRef(null)
    const [saveStatus, setSaveStatus] = useState('saved') // 'saving', 'saved'

    useEffect(() => {
        // Skip auto-save on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        // Clear any existing timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current)
        }

        // Only auto-save if there's a title
        if (title.trim()) {
            setSaveStatus('saving')
            // Debounce auto-save by 500ms
            autoSaveTimeoutRef.current = setTimeout(() => {
                onSave({ title, songs })
                setSaveStatus('saved')
            }, 500)
        }

        // Cleanup timeout on unmount
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current)
            }
        }
    }, [title, songs, onSave])

    const addSong = () => {
        if (!currentSong.title) return
        setSongs([...songs, { ...currentSong, id: Date.now().toString() }])
        setCurrentSong({ title: '', lyrics: '', color: '#ffffff' })
    }

    const removeSong = (index) => {
        setSongs(songs.filter((_, i) => i !== index))
        if (editingIndex === index) setEditingIndex(null)
    }

    const startEditing = (index) => {
        setEditingIndex(index)
    }

    const saveEdit = (index, updatedSong) => {
        const newSongs = [...songs]
        newSongs[index] = updatedSong
        setSongs(newSongs)
        setEditingIndex(null)
    }

    const cancelEdit = () => {
        setEditingIndex(null)
    }

    // Drag and drop handlers
    const handleDragStart = (index) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newSongs = [...songs]
        const draggedSong = newSongs[draggedIndex]
        newSongs.splice(draggedIndex, 1)
        newSongs.splice(index, 0, draggedSong)

        setSongs(newSongs)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    // Touch event handlers for mobile - only for drag handle
    const handleDragHandleTouchStart = (e, index) => {
        e.stopPropagation()
        setIsDragging(true)
        setDraggedIndex(index)
        setTouchStartY(e.touches[0].clientY)
        setTouchCurrentY(e.touches[0].clientY)
    }

    const handleTouchMove = (e) => {
        if (!isDragging || draggedIndex === null) return
        e.preventDefault()

        const touchY = e.touches[0].clientY
        setTouchCurrentY(touchY)

        // Find the container of song items
        const songContainer = e.currentTarget.parentNode
        const elements = Array.from(songContainer.children)
        let hoveredIndex = null

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i]
            const elRect = el.getBoundingClientRect()
            if (touchY >= elRect.top && touchY <= elRect.bottom) {
                hoveredIndex = i
                break
            }
        }

        if (hoveredIndex !== null && hoveredIndex !== draggedIndex) {
            const newSongs = [...songs]
            const draggedSong = newSongs[draggedIndex]
            newSongs.splice(draggedIndex, 1)
            newSongs.splice(hoveredIndex, 0, draggedSong)

            setSongs(newSongs)
            setDraggedIndex(hoveredIndex)
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        setDraggedIndex(null)
        setTouchStartY(null)
        setTouchCurrentY(null)
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={onCancel} style={{ background: 'transparent', paddingLeft: 0 }}>← Back to Home</button>
                <div style={{ fontSize: '0.9rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {saveStatus === 'saving' ? (
                        <>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ffcc00' }}></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' }}></span>
                            All changes saved
                        </>
                    )}
                </div>
            </div>
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
                            editingIndex === idx ? (
                                <EditSongCard
                                    key={song.id}
                                    song={song}
                                    index={idx}
                                    onSave={saveEdit}
                                    onCancel={cancelEdit}
                                />
                            ) : (
                                <div
                                    key={song.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    onTouchMove={(e) => handleTouchMove(e)}
                                    onTouchEnd={handleTouchEnd}
                                    className="glass"
                                    style={{
                                        padding: '1rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: `linear-gradient(90deg, ${song.color}11, transparent)`,
                                        cursor: 'default',
                                        opacity: draggedIndex === idx ? 0.5 : 1,
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span
                                                onTouchStart={(e) => handleDragHandleTouchStart(e, idx)}
                                                style={{
                                                    cursor: 'grab',
                                                    fontSize: '1.2em',
                                                    opacity: 0.5,
                                                    padding: '0.5rem',
                                                    margin: '-0.5rem',
                                                    touchAction: 'none',
                                                    userSelect: 'none'
                                                }}
                                            >⋮⋮</span>
                                            <span style={{ background: 'rgba(255,255,255,0.1)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em' }}>{idx + 1}</span>
                                            <strong>{song.title}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.8em', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: '50px' }}>
                                            {song.lyrics.substring(0, 40)}...
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => startEditing(idx)} style={{ padding: '0.4em 0.8em', background: 'rgba(100,150,255,0.2)', color: '#88aaff', border: 'none' }}>✎</button>
                                        <button onClick={() => removeSong(idx)} style={{ padding: '0.4em 0.8em', background: 'rgba(255,50,50,0.2)', color: '#ff8888', border: 'none' }}>✕</button>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
