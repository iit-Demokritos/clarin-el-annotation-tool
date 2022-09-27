import requests
from dataclasses import dataclass
from typing import List
import os
import dataclasses, json
from bson.objectid import ObjectId
#from dataclasses_json import dataclass_json
from PIL import Image ;# used for importing images as documents (only)
import base64

class EnhancedJSONEncoder(json.JSONEncoder):
        def default(self, o):
            if dataclasses.is_dataclass(o):
                return dataclasses.asdict(o,
                    dict_factory=lambda x: {k: v for (k, v) in x if v is not None})
            return super().default(o)

class APIObjectBase:
    def dumps(self):
        return json.dumps(self, cls=EnhancedJSONEncoder)

class Session:
    logged_in = False

    def __init__(self, URL='http://127.0.0.1:8000/',
                 username=None, password=None):
        self.URL = URL
        self.client = requests.session()
        self.getCSRFToken()
        if username:
            self.login(username, password)

    def __del__(self):
        try:
            self.logout()
        except Exception as ex:
            print("Exception:", ex)

    def check(self, response):
        if not response.ok:
            raise Exception(response.reason)
        data = response.json();
        if not data['success']:
            raise Exception(data['message'])
        return data

    def getCSRFToken(self):
        self.check(self.client.get(self.URL+'api/auth/gettoken'))  # sets cookie

    def getCookies(self):
        return self.client.cookies

    def login(self, username=None, password=None):
        self.username = username
        self.password = password
        data = self.check(self.client.post(self.URL+'api/auth/login',
            data={'email': username,'password': password, 'remember_me': False}))['data']
        self.access  = data['jwtToken']['access']
        self.refresh = data['jwtToken']['refresh']
        self.logged_in = True
        self.user = {
            'id':         data['id'],
            'email':      data['email'],
            'first_name': data['first_name'],
            'last_name':  data['last_name']
        }
        return data

    def logout(self):
        data = {}
        if self.logged_in:
            data = self.check(self.client.get(self.URL+'api/user/logout'))
            self.logged_in = False
        return data

    def get(self, path):
        if not self.logged_in:
            raise Exception("Please login first!")
        return self.check(self.client.get(self.URL+path))

    def post(self, path, data):
        if not self.logged_in:
            raise Exception("Please login first!")
        return self.check(self.client.post(self.URL+path,
            headers={'Content-Type': 'application/json'},
            data=json.dumps(data, cls=EnhancedJSONEncoder), json=data))

    def delete(self, path):
        if not self.logged_in:
            raise Exception("Please login first!")
        return self.check(self.client.delete(self.URL+path))

    ##
    ## Collections...
    ##
    def collections_get(self):
        return self.get('api/collections')['data']

    def collection_get(self, id):
        return self.get(f'api/collections/{id}')['data'][0]

    def collection_get_by_name(self, name):
        return next((col for col in self.collections_get() if col['name'] == name), None)

    def collection_create(self, name:str, handler:str='none', encoding:str='UTF-8', overwrite:bool=False):
        return self.post('api/collections', {'data': {
            'name':      name,
            'handler':   handler,
            'encoding':  encoding,
            'overwrite': overwrite
        }})

    ##
    ## Documents...
    ##
    def documents_get(self, cid):
        return iter(self.get(f'api/collections/{cid}/documents')['data'])

    def document_get(self, cid, did):
        return self.get(f'api/collections/{cid}/documents/{did}')['data']

    def document_create(self, cid, external_name, text,
                        encoding='UTF-8', handler='none', type='text',
                        name=None, data_binary=None, data_image=None):
        if not external_name:
            raise Exception('External name cannot be empty!')
        if not name:
            name = os.path.basename(external_name)
        return self.post(f'api/collections/{cid}/documents', {'data': {
            'name':          name,
            'type':          type,
            'text':          text,
            'collection_id': cid,
            'external_name': external_name,
            'encoding':      encoding,
            'handler':       handler,
            'data_binary':   base64.b64encode(data_binary).decode("latin1") if data_binary else None,
            'data_image':    base64.b64encode(data_image).decode("latin1")  if data_image  else None
        }})['data']

    def document_delete(self, cid, did):
        return self.delete(f'api/collections/{cid}/documents/{did}')['data']

    ##
    ## Annotations...
    ##
    def annotations_get(self, cid, did):
        return self.get(f'api/collections/{cid}/documents/{did}/annotations')['data']

    def annotations_save(self, cid, did, annotationData):
        if type(annotationData) is list:
            for ann in annotationData:
                ann.valid()
        else:
            annotationData.valid()
        return self.post(f'api/collections/{cid}/documents/{did}/annotations', {
            'data': annotationData
        })

    def annotations_delete_all(self, cid, did):
        return self.delete(f'api/collections/{cid}/documents/{did}/annotations/null');

    def annotations_delete_all_for_annotator(self, cid, did, annotator_id):
        return self.delete(f'api/collections/{cid}/documents/{did}/annotations/{annotator_id}');

    def annotations_delete_single(self, cid, did, annotation_id):
        return self.delete(f'api/collections/{cid}/documents/{did}/annotations/{annotation_id}');

    ##
    ## Objects...
    ##
    def collections(self):
        data = map(lambda x: Collection(session=self, exists=True, **x), self.collections_get())
        return list(data)

    def collection(self, id):
        data = self.collection_get(id)
        return Collection(session=self, exists=True, **data)

    def collectionGetByName(self, name):
        data = self.collection_get_by_name(name)
        return Collection(session=self, exists=True, **data)

    def collectionCreate(self, name:str, handler:str='none', encoding:str='UTF-8', overwrite:bool=False):
        data = self.collection_create(name, handler, encoding, overwrite)
        return Collection(name, handler, encoding, id=data['collection_id'], exists=True, session=self)

    def annotations(self, cid, did):
        data = map(lambda x: Annotation(**x), self.annotations_get(cid, did))
        return list(data)

#@dataclass_json
@dataclass
class Span(APIObjectBase):
    start:                 int          = None
    end:                   int          = None
    segment:               str          = None

Spans = List[Span]

#@dataclass_json
@dataclass
class Attribute(APIObjectBase):
    name:                  str          = None
    value:                 str          = None
    label:                 str          = None
    checked:               List[str]    = None
    confidence:            float        = None

Attributes = List[Attribute]

#@dataclass_json
@dataclass
class Annotation(APIObjectBase):
    _id:                   str          = ObjectId()
    collection_id:         int          = None
    document_id:           int          = None
    owner_id:              int          = None
    annotator_id:          str          = None
    document_attribute:    str          = None
    type:                  str          = None
    spans:                 Spans        = None
    attributes:            Attributes   = None
    created_at:            str          = None
    created_by:            str          = None
    updated_at:            str          = None
    updated_by:            str          = None
    deleted_at:            str          = None
    deleted_by:            str          = None
    collection_setting:    str          = None
    document_setting:      str          = None

    def __post_init__(self):
        if len(self.spans):
            spans = []
            for span in self.spans:
                if isinstance(span, dict):
                    spans.append(Span(**span))
                else:
                    spans.append(span)
            self.spans = spans
        if len(self.attributes):
            attributes = []
            for attribute in self.attributes:
                if isinstance(attribute, dict):
                    attributes.append(Attribute(**attribute))
                else:
                    attributes.append(attribute)
            self.attributes = attributes

    def is_valid(self):
        return all([
            self._id,
            self.annotator_id,
            self.type,
            self.collection_id,
            self.document_id
        ])

    def valid(self):
        assert self._id
        assert self.annotator_id
        assert self.type
        assert self.collection_id
        assert self.document_id
        return True

    def attributeGet(self, name):
        return next((x for x in self.attributes if x.name == name), None)

    def spansIncludeOffset(self, offset):
        for span in self.spans:
            if offset in range(span.start, span.end+1):
                return span
        return None

    def spansIncludeOffsets(self, start, end):
        for span in self.spans:
            r = range(int(span.start), int(span.end)+1)
            if start in r and end in r:
                return span
        return None


Annotations = List[Annotation]

#@dataclass_json
@dataclass
class Document(APIObjectBase):
    external_name:         str
    text:                  str
    handler:               str           = 'none'
    encoding:              str           = 'UTF-8'
    type:                  str           = 'text'
    name:                  str           = None
    data_text:             str           = None
    data_binary:           str           = None
    data_image:            str           = None
    id:                    int           = None
    collection_id:         int           = None
    owner_id:              int           = None
    owner_email:           str           = None
    visualisation_options: str           = None
    metadata:              str           = None
    is_opened:             bool          = None
    created_at:            str           = None
    updated_at:            str           = None
    updated_by:            str           = None
    version:               int           = None
    session:               Session       = None
    parent:                APIObjectBase = None
    annotations:           Annotations   = None

    def __post_init__(self):
        if not self.collection_id and self.parent and self.parent.id:
            self.collection_id = self.parent.id
        if not self.annotations and self.id:
            self.annotations = self.annotationsGet()

    def annotationsGet(self):
        # print("Annotations:", self.session.annotations_get(self.collection_id, self.id))
        return self.session.annotations(self.collection_id, self.id)

    def annotatorIdsGet(self):
        return list(set(map(lambda ann: ann.annotator_id, self.annotations)))

    def saveDocument(self):
        data = self.session.document_create(cid=self.collection_id,
                external_name=self.external_name, text=self.text,
                encoding=self.encoding, handler=self.handler,
                type=self.type, name=self.name,
                data_binary=self.data_binary,
                data_image=self.data_image)
        self.id = data['document_id']
        assert self.collection_id == data['collection_id']
        return self

    def annotationsSave(self, annotations=None):
        if not annotations:
            annotations = self.annotations
        data = self.session.annotations_save(
                cid=self.collection_id, did=self.id,
                annotationData=annotations)

    def annotationsByType(self, type):
        for ann in self.annotations:
            if ann.type == type:
                yield ann
        return None

    def annotationsDelete(self, annotator_id='null'):
        return self.session.annotations_delete_all_for_annotator(
            cid=self.collection_id, did=self.id, annotator_id=annotator_id);

    def annotationCreate(self, type, spans, attributes, annotator_id):
        return Annotation(
               _id           = str(ObjectId()),
               collection_id = self.collection_id,
               document_id   = self.id,
               owner_id      = self.session.user['id'],
               annotator_id  = annotator_id,
               type          = type,
               spans         = spans,
               attributes    = attributes
        )
    def annotationDelete(self, ann):
        assert dataclasses.is_dataclass(ann)
        assert self.collection_id == ann.collection_id
        assert self.id            == ann.document_id
        self.session.annotations_delete_single(ann.collection_id,
            ann.document_id, ann._id)

Documents = List[Document]

#@dataclass_json
@dataclass
class Collection(APIObjectBase):
    name:                  str
    handler:               str           = 'none'
    encoding:              str           = 'UTF-8'
    document_count:        int           = 0
    confirmed:             bool          = None
    is_owner:              bool          = None
    id:                    int           = None
    owner_id:              int           = None
    created_at:            str           = None
    updated_at:            str           = None
    exists:                bool          = False
    session:               Session       = None
    documents_open:        Documents     = None
    documents_new:         Documents     = None

    # def __post_init__(self):
    #     pass

    def save(self, overwrite:bool=False):
        data = self.session.collection_create(self.name, self.handler, self.encoding, overwrite)
        self.id = data['collection_id']
        self.exists  = data['exists']
        data = self.session.collection_get(self.id)
        ## Assert the data are valid
        Collection(**data)
        for key, value in data.items():
            setattr(self, key, value)
        return self

    def documents(self):
        for x in self.session.documents_get(self.id):
            yield Document(session=self.session, parent=self, **x)
        # data = map(lambda x: Document(session=self.session, parent=self, **x), self.session.documents_get(self.id))
        # self.documents_open = list(data)
        # return self.documents_open

    def document(self, did):
        data = self.session.document_get(self.id, did)
        return Document(session=self.session, parent=self, **data)

    def documentGetByName(self, name):
        return next((doc for doc in self.documents() if doc.name == name), None)

    def documentCreate(self, external_name, text, encoding='UTF-8', handler='none', type='text',
                annotations=None, name=None, data_binary=None, data_image=None):
        if not external_name:
            raise Exception('External name cannot be empty!')
        if not name:
            name = os.path.basename(external_name)
        doc = Document(external_name=external_name, text=text,
                encoding=encoding, handler=handler, type=type,
                annotations=annotations, name=name,
                data_binary=data_binary, data_image=data_image,
                collection_id=self.id, session=self.session, parent=self)
        if not self.documents_new:
            self.documents_new = []
        self.documents_new.append(doc)
        return doc

    def documentImageCreate(self, external_name, handler='none', annotations=None, name=None):
        if not external_name:
            raise Exception('External name cannot be empty!')
        with Image.open(external_name) as image:
            type  = image.format.lower()
        with open(external_name, 'rb') as fd:
            rawImageData = fd.read()
        return self.documentCreate(external_name, text=None, handler=handler, annotations=annotations, name=name, type=type, data_image=rawImageData)

    def documentDelete(self, doc):
        assert dataclasses.is_dataclass(doc)
        assert self.id == doc.collection_id
        if self.documents_open and doc in self.documents_open:
            self.documents_open.remove(doc)
        if self.documents_new and doc in self.documents_new:
            self.documents_new.remove(doc)
        return self.session.document_delete(self.id, doc.id)

Collections = List[Collection]
