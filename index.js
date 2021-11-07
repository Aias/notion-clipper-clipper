require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_KEY });

const databaseId = process.env.NOTION_DATABASE_ID;

const getPages = async (startCursor) => {
	const response = await notion.databases.query({
		database_id: databaseId,
		start_cursor: startCursor,
		filter: {
			and: [
				{
					property: 'Cleaned',
					checkbox: {
						does_not_equal: true
					}
				},
				{
					property: 'URL',
					url: {
						is_not_empty: true
					}
				}
			]
		},
		sorts: [
			{
				property: 'Created',
				direction: 'ascending'
			}
		]
	});
	const results = response.results;

	if (response.has_more) {
		let nextPage = await getPages(response.next_cursor);
		return results.concat(nextPage);
	} else {
		return results;
	}
};

const getPageBlocks = async (pageId, startCursor) => {
	const response = await notion.blocks.children.list({
		block_id: pageId,
		start_cursor: startCursor
	});
	const results = response.results;

	if (response.has_more) {
		let nextBlocks = await getPageBlocks(response.next_cursor);
		return results.concat(nextBlocks);
	} else {
		return results;
	}
};

const makeNewProps = (properties = {}) => {
	return {
		Name: {
			title: properties['Name'].title
			// Name
		},
		URL: {
			url: properties['URL'].url
		},
		Cleaned: {
			// Cleaned
			checkbox: true
		},
		Tags: {
			// Tags
			multi_select: properties['Tags'].multi_select
		}
	};

	// return Object.keys(properties).reduce((prev, cur) => {
	// 	return {
	// 		...prev,
	// 		[cur]: {
	// 			...properties[cur],
	// 			type: undefined,
	// 			id: undefined
	// 		}
	// 	};
	// }, {});
};

(async () => {
	const pages = await getPages();

	for (let i = 0; i < pages.length; i++) {
		const page = pages[i];
		const { parent, properties, icon, cover, id, archived } = page;

		// Duplicate page and properties without content.
		const newPage = await notion.pages.create({
			parent: {
				database_id: parent.database_id
			},
			// properties: newProps,
			properties: makeNewProps(properties),
			icon,
			cover
		});
		// Delete old page.
		const deletedPage = await notion.blocks.delete({
			block_id: id
		});
		console.log(`Cleaned page ${properties['Name'].title[0].text.content}`);
	}
})();
