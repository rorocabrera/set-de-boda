import { useState, useEffect } from 'react'
import Home from './components/Home'
import SetCreator from './components/SetCreator'
import SetViewer from './components/SetViewer'
import { fetchSets, createSet, updateSet, deleteSet as apiDeleteSet, migrateLocalDataToServer } from './api'

function App() {
  const [sets, setSets] = useState([])
  const [view, setView] = useState('home') // 'home', 'creator', 'viewer'
  const [activeSetId, setActiveSetId] = useState(null)
  const [editingSetId, setEditingSetId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load sets from API on mount
  useEffect(() => {
    loadSets()
  }, [])

  async function loadSets() {
    try {
      setLoading(true)
      const data = await fetchSets()
      setSets(data)

      // Auto-migrate localStorage data on first load if server is empty
      if (data.length === 0) {
        const localData = localStorage.getItem('music-sets')
        if (localData) {
          const confirm = window.confirm('Found local data. Would you like to migrate it to the server?')
          if (confirm) {
            await migrateLocalDataToServer()
            const newData = await fetchSets()
            setSets(newData)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load sets:', err)
      setError('Failed to connect to server. Using offline mode.')
      // Fallback to localStorage
      const saved = localStorage.getItem('music-sets')
      if (saved) setSets(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSet = async (setData) => {
    try {
      if (editingSetId) {
        await updateSet(editingSetId, setData)
        setSets(sets.map(s => s.id === editingSetId ? { ...setData, id: editingSetId } : s))
        setEditingSetId(null)
      } else {
        const newSet = await createSet(setData)
        setSets([...sets, newSet])
      }
      setView('home')
    } catch (err) {
      alert('Failed to save set: ' + err.message)
    }
  }

  const handleEditSet = (setId) => {
    setEditingSetId(setId)
    setView('creator')
  }

  const handleSelectSet = (setId) => {
    setActiveSetId(setId)
    setView('viewer')
  }

  const handleDeleteSet = async (setId) => {
    if (confirm('Are you sure you want to delete this set?')) {
      try {
        await apiDeleteSet(setId)
        setSets(sets.filter(s => s.id !== setId))
      } catch (err) {
        alert('Failed to delete set: ' + err.message)
      }
    }
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(sets, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `setdeboda-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = async (importedSets) => {
    if (!Array.isArray(importedSets)) {
      alert('Invalid data format. Expected an array of sets.')
      return
    }

    const confirmImport = confirm(
      `You are about to import ${importedSets.length} sets.\n\n` +
      `This will ADD them to your existing ${sets.length} sets.\n\n` +
      `Continue?`
    )

    if (!confirmImport) return

    let imported = 0
    let failed = 0

    for (const set of importedSets) {
      try {
        await createSet(set)
        imported++
      } catch (err) {
        console.error(`Failed to import "${set.title}":`, err)
        failed++
      }
    }

    // Reload data
    await loadSets()

    alert(
      `Import complete!\n\n` +
      `✅ Successfully imported: ${imported}\n` +
      (failed > 0 ? `❌ Failed: ${failed}` : '')
    )
  }

  const handleReorderSets = (reorderedSets) => {
    setSets(reorderedSets)
    // Note: Order is maintained in memory but not persisted to server
    // This is intentional as the backend doesn't have an order field
  }

  const activeSet = sets.find(s => s.id === activeSetId)
  const editingSet = sets.find(s => s.id === editingSetId)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵</div>
          <div>Loading your sets...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div style={{
          background: 'rgba(255, 200, 0, 0.1)',
          border: '1px solid rgba(255, 200, 0, 0.3)',
          padding: '1rem',
          margin: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

      {view === 'home' && (
        <Home
          sets={sets}
          onCreateClick={() => {
            setEditingSetId(null)
            setView('creator')
          }}
          onSelectSet={handleSelectSet}
          onEditSet={handleEditSet}
          onDeleteSet={handleDeleteSet}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onReorderSets={handleReorderSets}
        />
      )}

      {view === 'creator' && (
        <SetCreator
          initialData={editingSet}
          onSave={handleSaveSet}
          onCancel={() => {
            setEditingSetId(null)
            setView('home')
          }}
        />
      )}

      {view === 'viewer' && activeSet && (
        <SetViewer
          set={activeSet}
          onExit={() => {
            setActiveSetId(null)
            setView('home')
          }}
        />
      )}
    </>
  )
}

export default App
