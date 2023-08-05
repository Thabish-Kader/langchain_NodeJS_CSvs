import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

const filePath = "./docs";

export const run = async () => {
	try {
		const directoryLoader = new DirectoryLoader(filePath, {
			".txt": (path) => new TextLoader(path),
		});

		const rawDocs = await directoryLoader.load();
		console.log(rawDocs);
	} catch (error) {
		console.log("error", error);
		throw new Error("Failed to ingest your data");
	}
};

(async () => {
	await run();
	console.log("ingestion complete");
})();
