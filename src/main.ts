import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

const run = async () => {
	const loader = new TextLoader("./docs/data.txt");
	const docs = await loader.load();

	const vectorStore = await HNSWLib.fromDocuments(
		docs,
		new OpenAIEmbeddings({
			openAIApiKey: "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",
		})
	);

	const result = await vectorStore.similaritySearch("Hello world", 1);
	console.log(result);
};
run();
