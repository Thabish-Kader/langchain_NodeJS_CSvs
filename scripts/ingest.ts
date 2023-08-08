import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import {
	FunctionalTranslator,
	SelfQueryRetriever,
} from "langchain/retrievers/self_query";
import { OpenAI } from "langchain";
import {
	ConversationalRetrievalQAChain,
	loadQAStuffChain,
} from "langchain/chains";

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

async function queryPineconeVectorDb(
	client: any,
	indexName: any,
	question: any
) {
	const index = client.Index(indexName);
	const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

	let queryResponse = await index.query({
		queryRequest: {
			topK: 10,
			vector: queryEmbedding,
			includeMetadata: true,
			includeValues: true,
		},
	});

	console.log(`Found ${queryResponse.matches.length} matches...`);

	console.log(`Asking question: ${question}...`);
	if (queryResponse.matches.length) {
		// 9. Create an OpenAI instance and load the QAStuffChain
		const llm = new OpenAI({});
		const chain = loadQAStuffChain(llm);
		// 10. Extract and concatenate page content from matched documents
		const concatenatedPageContent = queryResponse.matches
			.map((match: any) => match.metadata.pageContent)
			.join(" ");
		// 11. Execute the chain with input documents and question
		const result = await chain.call({
			input_documents: [
				new Document({ pageContent: concatenatedPageContent }),
			],
			question: question,
		});
		// 12. Log the answer
		console.log(`Answer: ${result.text}`);
	} else {
		// 13. Log that there are no matches, so GPT-3 will not be queried
		console.log("Since there are no matches, GPT-3 will not be queried.");
	}
}

(async () => {
	const client = await initPinecone();
	await queryPineconeVectorDb(client, "demo", "Brief Summary on Noah's Ark ");
})();
