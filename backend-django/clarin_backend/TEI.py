import re
import lxml.etree as ET
from bs4 import BeautifulSoup
from dataclasses import dataclass
from dataclasses_json import dataclass_json
#import copy

class Element:
    def __init__(self, node, parent=None):
        self.node   = node
        self.parent = parent

    @property
    def tag(self):
        return self.node.tag

    @property
    def xml(self):
        return ET.tostring(self.node, encoding='unicode', pretty_print=True)

    def find(self, tag, wrapper=None, obj=None):
        node = self.node.find(tag)
        if node is None:
            return None
        if wrapper is None:
            wrapper = Element
        if obj is None:
            obj = self
        return wrapper(node, obj)

    def iterate(self, obj=None, node=None):
        if node is None:
            node = self.node
        for element in node:
            method = "tag_"+element.tag
            if method.startswith("tag_div"):
                method = "tag_div"
            attr = getattr(self, method, None);
            if callable(attr):
                attr(element, obj)
            else:
                print("No method:", element, self)

@dataclass_json
@dataclass
class Position:
    line:   int
    ch:     int
    offset: int
    #def __init__(self, l=0, c=0, o=0):
    #    self.line   = l
    #    self.ch     = c
    #    self.offset = o
    #def __str__(self):
    #    return self.__dict__.__str__()

@dataclass_json
@dataclass
class Mark:
    start: Position
    end:   Position
    tags:  str = None
    text:  str = None
    #def __init__(self, s=None, e=None, t=None, txt=None):
    #    self.start   = s
    #    self.end     = e
    #    self.tags    = t
    #    self.text    = txt
    #def __repr__(self):
    #    return vars(self)
    #def __str__(self):
    #    return vars(self).__str__()

class Processor(Element):
    def __init__(self, node, parent=None, processor=None):
        super().__init__(node, parent)
        if processor is None:
            self.init()
        else:
            self.from_p(processor)

    def init(self):
        self.marks_allow        = [
            "speaker", "stage", "quote", "emph", "note", "noteindex"
        ]
        self.newline_just_added = False
        self.is_note            = False
        self.node_index         = 1
        self.start_line         = 0 # = {"line": 0, "char": 0, "offset": 0}
        self.start_char         = 0 # = {"line": 0, "char": 0, "offset": 0}
        self.start_offset       = 0 # = {"line": 0, "char": 0, "offset": 0}
        # self.end         = {"line": 0, "char": 0, "offset": 0}
        self.end_line           = 0
        self.end_char           = 0
        self.end_offset         = 0
        self.text               = ""
        self.notes              = ""
        self.marks              = []
        #self.notes_start = {"line": 0, "char": 0, "offset": 0}
        self.notes_start_line   = 0
        self.notes_start_char   = 0
        self.notes_start_offset = 0
        #self.notes_end   = {"line": 0, "char": 0, "offset": 0}
        self.notes_end_line     = 0
        self.notes_end_char     = 0
        self.notes_end_offset   = 0
        self.notes_marks        = []

    def from_p(self, processor):
        # print(processor, "=>", self)
        self.marks_allow        = processor.marks_allow
        self.newline_just_added = processor.newline_just_added
        self.is_note            = processor.is_note 
        self.node_index         = processor.node_index
        self.text               = processor.text
        self.notes              = processor.notes
        #self.start       = copy.deepcopy(processor.start)
        #self.end         = copy.deepcopy(processor.end)
        self.start_line         = processor.start_line
        self.start_char         = processor.start_char
        self.start_offset       = processor.start_offset
        self.end_line           = processor.end_line
        self.end_char           = processor.end_char
        self.end_offset         = processor.end_offset
        self.notes_start_line   = processor.notes_start_line
        self.notes_start_char   = processor.notes_start_char
        self.notes_start_offset = processor.notes_start_offset
        self.notes_end_line     = processor.notes_end_line
        self.notes_end_char     = processor.notes_end_char
        self.notes_end_offset   = processor.notes_end_offset
        self.marks              = processor.marks
        self.notes_marks        = processor.notes_marks
        #self.marks              = copy.deepcopy(processor.marks)
        #self.notes_marks        = copy.deepcopy(processor.notes_marks)
        #self.notes_start = copy.deepcopy(processor.notes_start)
        #self.notes_end   = copy.deepcopy(processor.notes_end)
        # print(">>>", len(self.marks), self.marks, self)

    @property
    def text_with_notes(self):
        t = self.text+"\n"+self.notes
        return t.strip()

    @property
    def marks_with_notes(self):
        d = Position(self.end_line+1, 0, self.end_offset+1)
        return self.marks + self._displace(self.notes_marks, d)

    def _displace_position(self, p1, p2):
        return Position(p1.line+p2.line, p1.ch+p2.ch, p1.offset+p2.offset)

    def _displace_mark(self, m, d):
        return Mark(self._displace_position(m.start, d),
                    self._displace_position(m.end,   d),
                    m.tags, m.text)

    def _displace(self, marks, d):
        nmarks = []
        for m in marks:
            nmarks.append(self._displace_mark(m, d))
        return nmarks

    def _iterate(self, obj, node):
        # print("iterate:", node, node.text, list(node), flush=True)
        if (len(node)):
            p = Processor(node, self, self)
            p.iterate(obj)
            self.from_p(p)

    def get_range(self, text, start, end):
        return text[start.offset : end.offset]

    def get_text_range(self, start, end):
        if (not self.is_note):
            return self.get_range(self.text, start, end)
        else:
            return self.get_range(self.notes, start, end)

    def append_text(self, text, force=False):
        if text is None:
            return
        if len(text.strip()) == 0 and not force:
            return
        l = len(text)
        if (not self.is_note):
            self.newline_just_added = False
            #self.start = copy.deepcopy(self.end)
            self.start_line   = self.end_line
            self.start_char   = self.end_char
            self.start_offset = self.end_offset
            self.text        += text
            self.end_char    += l
            self.end_offset  += l
        else:
            #self.notes_start = copy.deepcopy(self.notes_end)
            self.notes_start_line   = self.notes_end_line
            self.notes_start_char   = self.notes_end_char
            self.notes_start_offset = self.notes_end_offset
            self.notes             += text
            self.notes_end_char    += l
            self.notes_end_offset  += l
        #print(f"TEXT: \"{text}\"")

    def append_newline(self):
        if (not self.is_note):
            if (self.newline_just_added):
                self.newline_just_added = False
                return
            self.newline_just_added = True
            #self.start = copy.deepcopy(self.end)
            self.start_line   = self.end_line
            self.start_char   = self.end_char
            self.start_offset = self.end_offset
            self.text        += "\n"
            self.end_line    += 1
            self.end_char     = 0
            self.end_offset  += 1
        else:
            #self.notes_start = copy.deepcopy(self.notes_end)
            self.notes_start_line   = self.notes_end_line
            self.notes_start_char   = self.notes_end_char
            self.notes_start_offset = self.notes_end_offset
            self.notes             += "\n"
            self.notes_end_line    += 1
            self.notes_end_char     = 0
            self.notes_end_offset  += 1

    def mark(self, start, end, tags):
        if self.marks_allow and tags not in self.marks_allow:
            return
        if (not self.is_note):
            m = self.marks
        else:
            m = self.notes_marks
        #m.append(Mark(start, end, tags, self.get_text_range(start, end)))
        m.append(Mark(start, end, tags))

    def process_node(self, node, obj=None, add_newline=False, add_tail=True):
        # print(f"<{node.tag}>:", self)
        if (not self.is_note):
            start = Position(self.end_line, self.end_char, self.end_offset)
        else:
            start = Position(self.notes_end_line, self.notes_end_char, self.notes_end_offset)
        self.append_text(node.text)
        self._iterate(obj, node)
        # print(f"<{node.tag}>")
        if (not self.is_note):
            end   = Position(self.end_line, self.end_char, self.end_offset) #copy.deepcopy(self.end)
        else:
            end   = Position(self.notes_end_line, self.notes_end_char, self.notes_end_offset) #copy.deepcopy(self.notes_end)
        self.mark(start, end, node.tag)
        if (add_newline):
            self.append_newline()
        if (add_tail):
            self.append_text(node.tail)

    def tag_body(self, node, obj=None):
        self.process_node(node, obj);

    def tag_div(self, node, obj=None):
        self.process_node(node, obj);

    def tag_sp(self, node, obj=None):
        self.process_node(node, obj);

    def tag_p(self, node, obj=None):
        self.process_node(node, obj, add_newline=True);

    def tag_speaker(self, node, obj=None):
        # self.append_newline()
        self.process_node(node, obj, add_newline=True);

    def tag_stage(self, node, obj=None):
        self.process_node(node, obj, add_newline=True);

    def tag_l(self, node, obj):
        self.process_node(node, obj, add_newline=True);

    def tag_milestone(self, node, obj):
        self.process_node(node, obj);

    def tag_placeName(self, node, obj):
        self.process_node(node, obj);

    def tag_quote(self, node, obj):
        self.process_node(node, obj);

    def tag_emph(self, node, obj):
        self.process_node(node, obj);

    def tag_foreign(self, node, obj):
        self.process_node(node, obj);

    def tag_note(self, node, obj):
        ## Add a "footnote" mark...
        start = Position(self.end_line, self.end_char, self.end_offset) #copy.deepcopy(self.end)
        self.append_text(str(self.node_index))
        end   = Position(self.end_line, self.end_char, self.end_offset) #copy.deepcopy(self.end)
        self.mark(start, end, node.tag+"index")
        ## Add an "index"...
        self.is_note = True 
        if self.node_index > 1:
            self.append_newline()
        start = Position(self.notes_end_line, self.notes_end_char, self.notes_end_offset) #copy.deepcopy(self.notes_end)
        self.append_text(str(self.node_index))
        end   = Position(self.notes_end_line, self.notes_end_char, self.notes_end_offset) #copy.deepcopy(self.notes_end)
        self.mark(start, end, node.tag+"index")
        self.append_text(" ", force=True)
        self.node_index += 1
        ## Add the note...
        self.process_node(node, obj, add_tail=False);
        ## Return to text mode...
        self.is_note = False
        self.append_text(node.tail)

class Header(Element):
    pass

class Division(Element):
    pass

class Matter(Processor):
    @property
    def divisions(self):
        for element in self.node.xpath("*[starts-with(local-name(), 'div')]"):
            yield Division(element)

class Text(Processor):
    @property
    def front(self):
        return self.find("front", Matter)

    @property
    def body(self):
        return self.find("body", Matter)

    @property
    def back(self):
        return self.find("back", Matter)

    @property
    def group(self):
        return self.find("group")

class Document(Element):
    @property
    def header(self):
        return self.find("teiCorpus", Header)

    @property
    def text(self):
        return self.find("text", Text)

class Corpus(Element):
    @property
    def documents(self):
        for element in self.node.iter("TEI", "TEI.2"):
            yield Document(element, self)

class TeiReader:
    __xmlns = re.compile(r' *xmlns(|\:\w+)="[^"]*"')
    __invalid_ampersand = re.compile(r'&(?=[ <])')

    def __do_transform(self, content):
        try:
            self.dom = ET.fromstring(content)
        except ET.XMLSyntaxError:
            # fallback to Beautiful Soup if there are some oddities in the XML file
            self.dom = ET.fromstring(bytes(bytearray(str(BeautifulSoup(content, "xml")), encoding='utf-8')))

        return Corpus(self.dom)

    def __clean_line(self, line):
        line = self.__xmlns.sub('', line)
        line = self.__invalid_ampersand.sub('&amp;', line)
        return line

    def __clean_lines(self, lines):
        return bytes(bytearray(''.join(self.__clean_line(line) for line in lines), encoding='utf-8'))

    def __clean_file(self, filename):
        with open(filename, encoding='utf-8') as file:
            return self.__clean_lines(file.readlines())

    def read_file(self, file_name):
        content = self.__clean_file(file_name)
        return self.__do_transform(content)

    def read_string(self, content):
        cleaned = self.__clean_lines(content.split('\n'))
        return self.__do_transform(cleaned)
