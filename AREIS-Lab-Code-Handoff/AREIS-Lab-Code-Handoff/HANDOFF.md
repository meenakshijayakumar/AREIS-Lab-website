# Current state and remaining design feedback

## Included

- Full-name AREIS header on an ice-white background; navy, cobalt, and pale-blue palette throughout, with Home navigation.
- The homepage hero uses a responsive collage of six supplied research photos, with activity captions rather than project names: assisted pollination, tactile fruit sensing, compliant mechanisms, wearable robotics, underwater robotics, and immersive robot control. Images retain natural colour, with gently rounded corners and serif captions; the old blue tint and animated scan overlay are removed. Photo selection/crops are in app/page.tsx and collage layout is in app/globals.css.
- The homepage intentionally omits the research index, selected projects, selected writing, and news sections. All dedicated pages and their content remain available through the navigation.
- The header has no separate Collaborate button, and the homepage collage has no research-area count. Contact remains in the main navigation.
- Collage photos have a short, staggered reveal the first time they enter view and a gentle desktop hover zoom. Reduced-motion preferences disable these effects; images remain visible without JavaScript. The Our premise photograph now has matching rounded corners; its source and crop are unchanged.
- Five separate research pages with source-photo galleries and complete diagram views.
- Seventeen projects and eighteen embedded project pictures imported from the supplied KU-CARS Word document. Project images sit to the right on desktop and stack on mobile. Lab room numbers are removed.
- Full team/alumni directory, publication search and pagination, project search, news stories, and contact form.
- All fifteen partner logos are present. White logos use dark backgrounds. Logo provenance is recorded in public/images/partners/SOURCES.json.
- Team and director photographs use circular crops and natural colour; missing-photo initials also appear in circles. The research-vision image has no yellow blend.
- Next.js and its ESLint configuration are pinned to 16.3.6, updating the original 16.2.9 dependencies for published security fixes. Use the current package-lock.json with npm ci.

## Unfinished visual choice

The homepage “Our premise” photo currently uses a crop of the supplied HumaRipe image. The owner said that it is not clear enough and does not match the accompanying text. A replacement was discussed but has NOT been implemented or approved. Preserve this feedback: seek a sharp, relevant original photograph showing a robotic hand sensing an object, or agree another visual direction. Do not describe the current photo as final.

## Content notes

Projects and research now read from the local `content/areis-website-content.xlsx` workbook on each page request. Save in Excel and refresh the browser; see README.md for worksheet instructions and `npm run content:check`. The original JSON/TS copies remain reference snapshots. The uploaded SharePoint workbook is not directly connected. Contact enquiries save to private local `data/contact-enquiries.csv`, readable in Excel; there are no notification emails or shared admin connection yet. No spotlight change was added.

Five team portraits were missing from the supplied ZIP and use initials. Do not fabricate portraits. Supplied project descriptions and publication metadata are source material, not independently verified claims. Older source sections contained inconsistent impact statistics; the source homepage's figures are used consistently in this version. The bibliography includes patents and preprints, so 268 records does not mean 268 peer-reviewed papers.

This package contains the current running site's code and referenced assets, not the old static original website. All paths are portable; it does not require the original author's OneDrive folders. The full source DOCX and earlier ZIP remain with the owner and are not runtime dependencies.
