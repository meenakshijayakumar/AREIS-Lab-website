import 'server-only'
import { cache } from 'react'
import { ContentWorkbookError, contentWorkbookPath, readContentWorkbook } from './content-workbook'
import type { WebsiteContent } from './content-workbook'

export type { Project, ResearchArea } from './content-workbook'

let lastGood: WebsiteContent | undefined
let lastError = ''

// Read each request; React cache only deduplicates reads within that request.
export const getWebsiteContent = cache(async (): Promise<WebsiteContent & { contentWarning?: string }> => {
  try {
    const content = await readContentWorkbook()
    lastGood = content
    lastError = ''
    return content
  } catch (error) {
    const message = `Content workbook ${contentWorkbookPath()}: ${error instanceof Error ? error.message : String(error)}`
    if (message !== lastError) {
      console.error(`${message}\nRun npm run content:check to check your workbook.${lastGood ? ' Serving the last valid content from this server process until the workbook is fixed.' : ''}`)
      lastError = message
    }
    // Excel can briefly lock/replace its file during a save. Retry on the next request.
    if (process.env.NODE_ENV === 'development') {
      const reason = error instanceof ContentWorkbookError ? error.message : 'The saved workbook could not be read. Check that it is available and try saving again.'
      return {
        ...(lastGood ?? { projects: [], researchAreas: [] }),
        contentWarning: `${reason}${lastGood ? ' Showing the previous valid content.' : ''}`,
      }
    }
    if (lastGood) return lastGood
    throw new Error('The content workbook could not be loaded. Check the server terminal for details.')
  }
})
