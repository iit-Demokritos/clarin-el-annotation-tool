# import os
# os.environ["TRANSFORMERS_CACHE"]="/mnt/home_WD_nvme/pepper/cache/transformers";
#import json
try:
    from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
    import torch
except ImportError as err:
    print("Django app nlp/pipelines.py: Cannot load modules:", err)
#from threading import Lock
#import logging
#import time

def gpu_info():
    return {
        "cuda": {
            "is_available": torch.cuda.is_available(),
            "device_count": torch.cuda.device_count()
        },
    }


sequence = """
Hugging Face Inc. is a company based in New York City. Its headquarters are in DUMBO,
therefore very close to the Manhattan Bridge which is visible from the window.
"""

class TransformersPipelineNERC:
    task                 = "ner"
    framework            = "pt"
    aggregation_strategy = "average"

    @property
    def model_name(self):
        return self.__model_name
    @model_name.setter
    def model_name(self, model_name):
        self.__model_name = model_name
        self.model      = None
        self.tokeniser  = None
        self.pipeline   = None

    def __init__(self, model_name=None):
        self.model_name = model_name

    def _load_model(self):
        if not self.model_name:
            raise Exception("Please specify a model name.") 
        if not self.model:
            self.model     = AutoModelForTokenClassification.from_pretrained(self.model_name)
        if not self.tokeniser:
            self.tokeniser = AutoTokenizer.from_pretrained(self.model_name)
        if not self.pipeline:
            self.pipeline  = pipeline(task=self.task, model=self.model, tokenizer=self.tokeniser,
                framework=self.framework, aggregation_strategy=self.aggregation_strategy)
        if not self.pipeline:
            raise Exception(f"Could not load model: {self.model_name}.")

    def apply(self, text_sequence = None):
        if not self.pipeline:
            self._load_model()
        return self.pipeline(text_sequence)
