import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const initPinecone = async () => {
	try {
		const pinecone = new PineconeClient();
		await pinecone.init({
			environment: process.env.PINECONE_ENVIRONMENT!,
			apiKey: process.env.PINECONE_API_KEY!,
		});
		return pinecone;
	} catch (error) {
		console.log(error);
		throw new Error("Failed to initialize Pinecone");
	}
};

export const run = async () => {
	try {
		// load the document from the directory
		const directoryLoader = new DirectoryLoader("./docs", {
			".txt": (path) => new TextLoader(path),
		});

		const rawDocs = await directoryLoader.load();
		const vectorStore = await HNSWLib.fromDocuments(
			rawDocs,
			new OpenAIEmbeddings()
		);

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

		// Initalize pinecone
		const pinecone = await initPinecone();
		const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

		// insert documents into pinecone
		await PineconeStore.fromDocuments(rawDocs, embeddings, {
			pineconeIndex: pineconeIndex,
			namespace: "demo",
			textKey: "text",
		});
	} catch (error) {
		console.log("error", error);
		throw new Error("Failed to ingest your data");
	}
};
// TODO: Query the database
// const ask = async () => {
// 	const pinecone = await initPinecone();

// 	const index = pinecone.Index("demo");
// 	const embeddings = new OpenAIEmbeddings();
// 	const res = await embeddings.embedQuery("Hello world");
// 	const queryResponse = await index.query(res);
// };

(async () => {
	await run();
	console.log("Data insertion complete");
})();
