import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const filePath = "./docs";

export const run = async () => {
	try {
		// load the document from the directory
		const directoryLoader = new DirectoryLoader(filePath, {
			".txt": (path) => new TextLoader(path),
		});

		const rawDocs = await directoryLoader.load();

		// Split the text into chunks to learn more: https://js.langchain.com/docs/modules/data_connection/document_transformers/
		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});
		const output = await splitter.splitDocuments(rawDocs);
		console.log(output);
	} catch (error) {
		console.log("error", error);
		throw new Error("Failed to ingest your data");
	}
};

(async () => {
	await run();
	console.log("ingestion complete");
})();
