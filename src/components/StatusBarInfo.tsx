import { useStatusBarInfo } from '@/hooks/useStatusBarInfo'

export function StatusBarInfo() {
  const { statusBarInfo, loading, error, refresh } = useStatusBarInfo()

  if (loading) {
    return <div>Loading status bar info...</div>
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="font-bold mb-2">Status Bar Information</h3>
      {statusBarInfo && (
        <div className="space-y-1 text-sm">
          <p><strong>Visible:</strong> {statusBarInfo.visible ? 'Yes' : 'No'}</p>
          <p><strong>Style:</strong> {statusBarInfo.style}</p>
          <p><strong>Color:</strong> {statusBarInfo.color || 'Default'}</p>
          <p><strong>Overlays:</strong> {statusBarInfo.overlays ? 'Yes' : 'No'}</p>
        </div>
      )}
      <button 
        onClick={refresh}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Refresh
      </button>
    </div>
  )
}
