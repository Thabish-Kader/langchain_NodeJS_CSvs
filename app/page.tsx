"use client";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";

export default function Home() {
	const loader = new DirectoryLoader("../docs", {
		".txt": (path) => new TextLoader(path),
	});
	console.log(loader);

	return (
		<main className="">
			<h1>Hello world</h1>
		</main>
	);
}
