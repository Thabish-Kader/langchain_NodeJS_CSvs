import { ChatOpenAI } from "langchain/chat_models/openai";
import { config } from "dotenv";
import { HumanMessage, ChatMessage, SystemMessage } from "langchain/schema";

config();

const chat = new ChatOpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY,
	temperature: 0,
});

const predictSockCompany = async () => {
	const result = await chat.predictMessages([
		new HumanMessage(
			"Translate this sentence from English to French. I love programming."
		),
	]);

	console.log(result);
};

predictSockCompany();
