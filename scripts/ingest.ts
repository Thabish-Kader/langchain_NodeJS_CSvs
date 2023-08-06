import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChromaClient } from "chromadb";

export const run = async () => {
	try {
		// load the document from the directory
		const directoryLoader = new DirectoryLoader("./docs", {
			".txt": (path) => new TextLoader(path),
		});

		const rawDocs = await directoryLoader.load();

		// Split the text into chunks to learn more: https://js.langchain.com/docs/modules/data_connection/document_transformers/
		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});
		const splitDocument = await splitter.splitDocuments(rawDocs);

		/*
		Create Embeddings
			- Represent the split document as a set of vectors - [0.1,0.2,0.3.....]
			- Makes it easier to semantic search (look up similar text in the document)
		*/
		const embeddings = new OpenAIEmbeddings();
		const documentRes = await embeddings.embedDocuments(["hello", "hi"]);

		// ChromaDB
		const client = new ChromaClient();
	} catch (error) {
		console.log("error", error);
		throw new Error("Failed to ingest your data");
	}
};

(async () => {
	await run();
	console.log("ingestion complete");
})();
