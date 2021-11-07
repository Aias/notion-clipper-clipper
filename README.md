# notion-clipper-clipper

When using Notion's official web clipper, the contents of the page are saved along with the link. I don't need all that bulk, just the links.

This node script uses the Notion SDK to clear the contents of these saved pages, leaving just the page placeholders and properties. It requires a `.env` file with a `NOTION_KEY` and `NOTION_DATABASE_ID`. It's also hard-coded to the property names of my own links database, so probably won't work out of the box for other environments.
