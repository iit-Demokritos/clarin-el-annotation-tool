from django.test import TestCase

# Create your tests here.

from .pipelines import *

adu = TransformersPipelineNERC("dslim/bert-base-NER")

for entity in adu.apply("My name is George"):
    print(entity)
