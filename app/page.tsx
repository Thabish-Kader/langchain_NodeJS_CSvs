import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
	JSONLinesLoader,
	JSONLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import Image from "next/image";

export default function Home() {
	const run = async () => {
		try {
			const loader = new DirectoryLoader("./docs", {
				".json": (path) => new JSONLoader(path, "/texts"),
				".jsonl": (path) => new JSONLinesLoader(path, "/html"),
				".txt": (path) => new TextLoader(path),
				".csv": (path) => new CSVLoader(path, "text"),
			});
			const docs = await loader.load();
			console.log({ docs });
		} catch (error) {}
	};

	return <main className=""></main>;
}
