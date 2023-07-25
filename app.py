import os
import sys
from apikey import apikey
from langchain.document_loaders import TextLoader

os.environ["OPENAI_API_KEY"] = apikey

query