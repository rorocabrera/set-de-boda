import React, { useState } from 'react'
import { Download, Upload } from 'lucide-react'

export default function Home({ sets, onCreateClick, onSelectSet, onEditSet, onDeleteSet, onExportData, onImportData, onReorderSets }) {
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [touchStartY, setTouchStartY] = useState(null)
    const [touchCurrentY, setTouchCurrentY] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        onImportData(data);
                    } catch (error) {
                        alert('Error reading file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    // Drag and drop handlers
    const handleDragStart = (index) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newSets = [...sets]
        const draggedSet = newSets[draggedIndex]
        newSets.splice(draggedIndex, 1)
        newSets.splice(index, 0, draggedSet)

        onReorderSets(newSets)
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

        // Find the container of set items
        const setContainer = e.currentTarget.parentNode
        const elements = Array.from(setContainer.children).filter(el =>
            el.draggable === true // Only consider draggable elements (exclude the "Create New Set" button)
        )
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
            const newSets = [...sets]
            const draggedSet = newSets[draggedIndex]
            newSets.splice(draggedIndex, 1)
            newSets.splice(hoveredIndex, 0, draggedSet)

            onReorderSets(newSets)
            setDraggedIndex(hoveredIndex)
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        setDraggedIndex(null)
        setTouchStartY(null)
        setTouchCurrentY(null)
    }

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Music Sets</h1>
                    <p style={{ opacity: 0.7, margin: '0.5rem 0 0 0' }}>Select a set to start or create a new one.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={onExportData} style={{ padding: '0.6rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Export all sets to JSON">
                        <Download size={18} />
                    </button>
                    <button onClick={handleImport} style={{ padding: '0.6rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Import sets from JSON">
                        <Upload size={18} />
                    </button>
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginTop: '2rem',
                maxWidth: '800px',
                margin: '2rem auto 0'
            }}>
                {sets.map((set, idx) => (
                    <div
                        key={set.id}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        onTouchMove={(e) => handleTouchMove(e)}
                        onTouchEnd={handleTouchEnd}
                        className="glass"
                        style={{
                            padding: '1.5rem',
                            textAlign: 'left',
                            position: 'relative',
                            cursor: 'default',
                            opacity: draggedIndex === idx ? 0.5 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span
                                onTouchStart={(e) => handleDragHandleTouchStart(e, idx)}
                                style={{
                                    cursor: 'grab',
                                    fontSize: '1.5em',
                                    opacity: 0.5,
                                    padding: '0.5rem',
                                    margin: '-0.5rem',
                                    touchAction: 'none',
                                    userSelect: 'none'
                                }}
                            >⋮⋮</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ marginTop: 0, marginBottom: '0.3rem', fontSize: '1.3rem' }}>{set.title}</h2>
                                <p style={{ opacity: 0.6, margin: 0, fontSize: '0.9rem' }}>{set.songs.length} Songs</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', paddingLeft: 'calc(1.5em + 1rem)' }}>
                            <button className="primary" onClick={() => onSelectSet(set.id)} style={{ padding: '0.6rem 1.2rem', flex: 1 }}>Open</button>
                            <button onClick={(e) => { e.stopPropagation(); onEditSet(set.id); }} style={{ padding: '0.6rem 1rem', background: 'rgba(100,150,255,0.2)', color: '#88aaff' }}>✎</button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteSet(set.id); }} style={{ padding: '0.6rem 1rem', background: 'rgba(255,50,50,0.2)', color: '#ff8888' }}>✕</button>
                        </div>
                    </div>
                ))}

                <button
                    className="glass"
                    onClick={onCreateClick}
                    style={{
                        padding: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderStyle: 'dashed',
                        background: 'rgba(255,255,255,0.02)',
                        minHeight: '100px',
                        color: 'inherit',
                        gap: '1rem'
                    }}
                >
                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Create New Set</span>
                </button>
            </div>
        </div>
    )
}
