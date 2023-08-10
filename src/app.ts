import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Loaders
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

import { config } from "dotenv";
import fs from "fs";
import { Document } from "langchain/document";

config();

// Read data useing doc loader
const loader = new DirectoryLoader("./docs", {
	".json": (path) => new JSONLoader(path),
	".txt": (path) => new TextLoader(path),
	".csv": (path) => new CSVLoader(path),
	".pdf": (path) => new PDFLoader(path),
});

// See contents of docs that are being being loaded
const docs = await loader.load();
// console.log(docs);

const normalizeDocs = (docs: Document[]) => {
	return docs.map((doc: Document) => {
		if (typeof doc.pageContent === "string") {
			return doc.pageContent;
		} else if (Array.isArray(doc.pageContent)) {
			return (doc.pageContent as string[]).join("\n");
		} else {
			return "";
		}
	});
};

const run = async (question: string) => {
	const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
	let vectorStore;

	// if (fs.existsSync("MyVectore.index")) {
	// 	console.log("Vectorstore already exists");
	// 	vectorStore = await HNSWLib.load(
	// 		"MyVectore.index",
	// 		new OpenAIEmbeddings()
	// 	);
	// 	console.log(`Vectorstore loader -----> ${vectorStore}`);
	// } else {
	// 	console.log(`Vectorstore does not exist createing.....`);
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 256,
		chunkOverlap: 100,
	});
	console.log(`Text Splitted ----> ${textSplitter}`);
	const normalizedDocs = normalizeDocs(docs);
	const splitDocs = await textSplitter.createDocuments(normalizedDocs);

	// Create vectorstore
	vectorStore = await HNSWLib.fromDocuments(
		splitDocs,
		new OpenAIEmbeddings()
	);
	// 17. Save the vector store to the specified path
	await vectorStore.save("MyVectore.index");
	console.log(`Vector store created ----> ${vectorStore}`);
	// }

	// RetrievalQAChain
	const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
	console.log("Querying...");
	const res = await chain.call({ query: question });
	console.log(res);
};

run("What is the data about ?");
