import { getWebsiteContent } from '../lib/website-content'

export async function ContentNotice() {
  const { contentWarning } = await getWebsiteContent()
  if (!contentWarning) return null

  return <aside className="content-notice" role="alert">
    <strong>Excel changes not applied.</strong>
    <p>{contentWarning}</p>
    <p>Correct the cell, save in Excel, then refresh.</p>
  </aside>
}
