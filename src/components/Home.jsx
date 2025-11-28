import React from 'react'

export default function Home({ sets, onCreateClick, onSelectSet, onEditSet, onDeleteSet, onExportData, onImportData }) {
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

    return (
        <div className="animate-fade-in" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Music Sets</h1>
                    <p style={{ opacity: 0.7, margin: '0.5rem 0 0 0' }}>Select a set to start or create a new one.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={onExportData} style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)' }} title="Export all sets to JSON">
                        📥 Export
                    </button>
                    <button onClick={handleImport} style={{ padding: '0.6rem 1rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)' }} title="Import sets from JSON">
                        📤 Import
                    </button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                marginTop: '2rem'
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
