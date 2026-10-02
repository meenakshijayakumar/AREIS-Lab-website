# AREIS Lab — Microsoft 365 connection plan

Status: Microsoft 365 integration remains proposed; no cloud connection is active. The local website now reads its active `content/areis-website-content.xlsx` on each request, and contact enquiries save to private `data/contact-enquiries.csv`. Save the active local workbook and refresh the browser to update content. This folder's earlier exported workbook and the uploaded SharePoint copy are separate files. See the project README for the local workflow and optional synced-folder path. No spotlight design was added.

## Website content

1. Store `areis-website-content.xlsx` in a lab-owned SharePoint document library and give the content editors access.
2. Keep the worksheet/table names and stable project/research slugs. Edit the content cells and ordering fields as described in the workbook's Instructions tab.
3. Connect the website's server to that workbook through Microsoft Graph. Download and parse the saved workbook on the server; visitors should not receive Microsoft credentials or access to the library.
4. Feed the downloaded workbook into the existing shared content reader. The homepage, directory pages, individual pages, page titles, images, and next-project links already use it for local content.
5. Use a short refresh interval (proposed: 60 seconds). Validate rows before displaying them and retain the last valid published content if the service is unavailable or an edit is invalid.

The image cells reference the existing website assets. Changing text in Excel does not upload a new image. A new image needs to be added to the website's asset storage, then referenced in the workbook. The existing photographs remain bundled with the website.

## Contact enquiries

Create a private Microsoft List in the same lab SharePoint site, named `Website Enquiries`, with these fields:

| Field | Type | Purpose |
| --- | --- | --- |
| Title | Single line of text | Enquiry reference |
| Name | Single line of text | Visitor name |
| Email | Single line of text | Reply address |
| Topic | Choice | The website's enquiry categories |
| Message | Multiple lines of plain text | Visitor's message |
| Status | Choice | New, In progress, Closed |

SharePoint provides created/modified timestamps. Give the appropriate lab admin group access to review and update enquiries. Admins can export this list to Excel; edits to that exported Excel copy do not update the list.

The website's contact handler should validate required fields and lengths, reject automated spam where possible, and create the list item on the server. Show a success message only after Microsoft confirms that the item was created. On failure, preserve the entered details and offer a retry or the lab's email address. Keep enquiry records separate from the public website content.

## Connection details needed

- The lab's SharePoint site URL and chosen document library.
- The uploaded workbook and the enquiry list.
- An administrator-approved Microsoft Entra application with read access to the content workbook and write access to the enquiry list. Microsoft Graph Selected permissions can restrict access to these resources.
- Server-side credentials configured privately in the hosting environment; do not put them in the workbook, browser code, source control, or a chat message.
- A hosting service capable of running the existing Next.js server and its contact API, rather than serving only static HTML.

## Why enquiries use a list

Microsoft supports creating SharePoint list items with application authentication. Its Excel table-row API does not support application permissions. A SharePoint list gives administrators a shared, editable grid and Excel export without making a shared workbook the destination of every public form submission.

## Microsoft references

- [Download a workbook/file through Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0)
- [Create a SharePoint list item](https://learn.microsoft.com/en-us/graph/api/listitem-create?view=graph-rest-1.0)
- [Selected permissions for SharePoint and OneDrive](https://learn.microsoft.com/en-us/graph/permissions-selected-overview)
- [Excel table-row API permissions](https://learn.microsoft.com/en-us/graph/api/tablerowcollection-add?view=graph-rest-1.0)
- [Export a SharePoint/Microsoft list to Excel](https://support.microsoft.com/en-us/sharepoint/lists/data-and-lists/export-to-excel-from-sharepoint-or-lists)
