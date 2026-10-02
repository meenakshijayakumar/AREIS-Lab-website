# AREIS Lab website — code handoff

This is the current interactive website, including all code and the local images it uses. It is a Next.js + React + TypeScript project, not a standalone HTML file.

## Open and run

1. Extract the entire ZIP. Do not run files while they are still inside the ZIP.
2. Install Node.js 22.18 or a newer supported version, including npm. The workbook validation commands use Node's built-in TypeScript support.
3. Open the extracted `AREIS-Lab-Code-Handoff` folder in your editor or Codex. This is the folder containing `package.json`.
4. Open a terminal in that folder and run:

```sh
npm ci
npm run dev
```

5. Open **http://localhost:3000**. Keep the terminal running. Stop the server with Ctrl+C.

On Windows, if PowerShell blocks npm scripts, use `npm.cmd ci` and `npm.cmd run dev` instead. If port 3000 is occupied, run `npm run dev -- --port 3001` and open http://localhost:3001.

Internet is needed to install dependencies and fetch the Google fonts on the first compilation/build. No API key, database, environment file, or paid service is required. Images are bundled locally. Profile/publication links open external sites.

## Give this to Codex

Paste the following after opening this project folder:

> Read README.md and AGENTS.md. This is an existing AREIS Lab Next.js website. Install the exact dependencies with npm ci, run npm run dev, and verify the home, research, projects, people, publications, news, and contact pages. Use npm.cmd on Windows if needed. Keep the existing content, images, blue-and-white design, and separate detail pages. Do not rebuild the site from scratch. Tell me the local URL and help me make further changes. The current Our premise photo is not yet approved; consult HANDOFF.md before changing it.

## Checks and production

```sh
npm run content:check
npm run content:test
npm run contact:test
npm run typecheck
npm run lint
npm run build
npm run start
```

Run `build` before `start`. For a development workflow, use `dev` instead.

## Update projects and research in Excel

Open **`content/areis-website-content.xlsx` inside this project folder** in Excel. This is the active workbook; the earlier export in `outputs` and the uploaded SharePoint copy are separate files.

1. Edit the relevant worksheet, keeping the column headings and worksheet names.
2. Save in Excel (Ctrl+S), then refresh http://localhost:3000 in your browser.
3. Project/research directories and detail pages read the saved file on each request. No code edits, rebuild, or server restart are needed. Unsaved edits do not appear; an already-open browser page needs a refresh.

| Worksheet | What it controls |
| --- | --- |
| Projects | Project titles, descriptions, categories, website links, page slugs, display order |
| ProjectImages | Each project's photographs, in display order |
| Research | Research titles, summaries, focus text, map image, page slugs, cover selection |
| ResearchParagraphs | Paragraphs on research detail pages |
| ResearchTags | Research focus topics |
| ResearchImages | Gallery photographs, captions, dimensions, display order |
| ResearchInitiatives | Startup initiatives shown on research detail pages |

The workbook starts with all 17 projects and 5 research areas, their original text, and all image references. People, publications, news, and general homepage copy still use the existing source files.

Keep `slug` values stable: they form page URLs and connect the image/paragraph rows to their parent. To add an entry, add a row with a unique slug and positive `order`; add related rows using that slug. To remove an entry, also remove its related rows. Order numbers must be unique within each list (or within each parent on child worksheets). `coverImageOrder` must match a gallery row's `order` for that research area. Slug changes change links, so avoid renaming existing slugs casually.

Slugs automatically use lowercase in website URLs: `Hi` becomes `/projects/hi`. Matching child references also ignore case, and `Hi` / `hi` count as the same slug. Use letters, numbers, and hyphens. For a new project, fill all five required columns: `slug`, `order`, `title`, `text`, and `category`; `url` and images are optional.

Image cells contain paths, not embedded pictures. Place new photographs under `public/images/` and enter paths such as `/images/my-photo.jpg`. Preserve spaces and letter case. Gallery width/height are the image's pixel dimensions. Keep the workbook as `.xlsx` and use plain values; the reader does not calculate formulas.

Run `npm.cmd run content:check` to validate the workbook and image paths. During local development, invalid data also shows an **Excel changes not applied** notice on content pages, with the worksheet, row, and field to fix. File access errors show a generic notice; detailed filesystem information remains in the server terminal. After a successful load, the running server keeps its last valid content if Excel temporarily locks the file or an edit is invalid; fix the error, save, and refresh. This fallback lasts only for that server process. The notice disappears after a valid save. Production keeps diagnostics in the server terminal; an invalid workbook at production startup must be fixed before content pages can load.

### Use a different local or OneDrive-synced workbook

The default active file is `content/areis-website-content.xlsx`. To use another local file, set `CONTENT_WORKBOOK_PATH` in `.env.local`, then restart the server once:

```dotenv
CONTENT_WORKBOOK_PATH="C:/path/to/your/areis-website-content.xlsx"
```

Use your actual path with forward slashes. `content:check` reads the same environment file. For a OneDrive-synced file, keep it available on this device and wait for local sync to finish before refreshing. A SharePoint sharing URL is not a local path; no direct Microsoft 365 connection has been configured.

When hosting online, the server must also have the workbook. Editing a laptop file will not update a separate hosted server. Choose shared storage/authentication when hosting is decided; do not make the admin workbook public just to connect it.

## Contact enquiries

The contact form saves submissions to **`data/contact-enquiries.csv`** on the computer running the website. The file is created on the first successful submission and opens in Excel. Each row has a unique ID, UTC receipt time, name, email, enquiry topic, and message. This file is private server data: it is outside `public`, excluded from Git, and has no public download endpoint. Keep it separate from the website-content workbook.

Open the CSV to review submissions; close it in Excel when finished so Excel does not block new writes. If saving fails, the form reports a failure and retains the visitor's details. A success message means the enquiry was saved; no notification email is sent. Reopen the CSV to see later entries. Back up this file yourself while using local storage.

To change its location, set `CONTACT_ENQUIRIES_PATH="C:/path/to/private/contact-enquiries.csv"` in `.env.local` and restart. Never point it into `public`. This local storage supports one server process on a writable disk. Online hosting with multiple instances or temporary disks needs shared persistent storage before launch. Shared Microsoft 365 access and admin notifications are not connected yet.

## Where to edit

- `app/page.tsx`: homepage and Our premise photograph.
- `app/globals.css`: colours, fonts, spacing, image treatments, responsive layout.
- `app/components/site-shell.tsx`: logo, full lab name, header navigation, footer.
- `content/areis-website-content.xlsx`: active project and research content.
- `app/lib/content-workbook.ts` and `app/lib/website-content.ts`: workbook validation and server-side loading.
- `app/site-content.json`: team/alumni profiles, bibliography, news, partners, biography, and contact options; also retains the original project snapshot for reference.
- `app/content-browsers.tsx`: project/team filters and publication search/pagination.
- `app/api/contact/route.ts` and `app/lib/contact-enquiries.ts`: contact validation and private local CSV storage.
- `app/research-data.ts` and `app/research-content.ts`: original research snapshot for reference; the website now reads research from Excel.
- `app/research/[slug]/page.tsx`: separate research-area pages.
- `app/projects/[slug]/page.tsx`: project details and original pictures.
- `app/news/[slug]/page.tsx`: complete news stories.
- `public/`: all referenced photographs, diagrams, and logos. Preserve filenames and relative paths, including spaces and letter case.

No `node_modules`, `.next` cache, credentials, old website ZIPs, or unrelated documents are included. `npm ci` restores the dependencies from `package-lock.json`.

## Packaging verification

The original handoff passed a clean install and production build. Project and research routes now render on request so saved workbook edits and new slugs can be read without rebuilding. Include the `content` folder when copying or deploying the website.
