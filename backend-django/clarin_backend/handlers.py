from abc import ABC, abstractmethod
import json

from .TEI import TeiReader


class AbstractHandlerClass(ABC):

    def __init__(self,binaryfile,type):
        self.binaryfile = binaryfile
        self.type=type
        super().__init__()

    @abstractmethod
    def apply(self):
      pass


class HandlerClass(AbstractHandlerClass):
    def __init__(self, binaryfile, type):
        super().__init__(binaryfile,type)

    def applytext(self):

        return {"text":"text"}

    def applytei(self):
        reader = TeiReader()
        if isinstance(self.binaryfile, str):
            text = self.binaryfile
        else:
            text = self.binaryfile.read().decode("utf-8")
        items = []

        corpus = reader.read_string(text)
        for doc in corpus.documents:
            content = doc.text
            content.iterate()
            text  = content.text_with_notes
            marks = content.marks_with_notes
            ## Calculate an array that maps lines to "gutter" lines...
            lines = text.splitlines()
            gutter = [str(i) for i in range(1,len(lines)+1)]
            ## Iterate over marks, and select the "silent" ones...
            silent_marks = ["stage", "speaker"]
            for mark in marks:
                if mark.start.ch == 0 and mark.tags in silent_marks:
                    gutter.insert(mark.start.line, "")
            items.append({"text":  text, "info": {
                "marks": [x.to_dict() for x in marks],
                "gutter": gutter[:len(lines)+2]
            }})
        return {"documents": items}

    def apply(self):
        function_name = "apply" + self.type
        apply_method = getattr(HandlerClass, function_name)
        result = apply_method(self)
        #apply_method = getattr(C, "m")
        return result
