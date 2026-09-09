/**
 * Exports data to a CSV file and triggers a download in the browser.
 */
export function exportToCSV(data: any[], fileName: string) {
    if (data.length === 0) return

    // Extract headers from the first object
    const headers = Object.keys(data[0])

    // Create CSV content
    const csvRows = [
        headers.join(','), // header row
        ...data.map(row =>
            headers.map(fieldName => {
                const value = row[fieldName]
                // Escape quotes and wrap in quotes if it contains commas
                const escaped = ('' + (value ?? '')).replace(/"/g, '""')
                return `"${escaped}"`
            }).join(',')
        )
    ]

    const csvString = csvRows.join('\n')

    // Create blob and download link
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}
