import os
import sys
from dotenv import load_dotenv
from langchain.document_loaders import TextLoader

load_dotenv()

apikey = os.getenv("API_KEY")

