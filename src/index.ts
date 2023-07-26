import { config } from "dotenv";
import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";

config();

const llm = new OpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY!,
	temperature: 0.9,
});

const prompt = PromptTemplate.fromTemplate(
	"What is a good name for a company that makes {product}?"
);

const predictSockCompany = async () => {
	const formattedPrompt = await prompt.format({
		product: "colorful socks",
	});

	const result = await llm.predict(formattedPrompt);
	console.log(result);
};

predictSockCompany();
