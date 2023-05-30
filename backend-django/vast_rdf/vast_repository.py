from rdflib import Graph, URIRef, Literal
from rdflib.namespace import RDF, RDFS, XSD, FOAF
from rdflib import Namespace
from rdflib.graph import DATASET_DEFAULT_GRAPH_ID
from rdflib.plugins.stores.sparqlstore import SPARQLUpdateStore
from client.api import Session
import rdflib
from dataclasses import dataclass
import hashlib
from dotenv import dotenv_values
import os

NAMESPACE_VAST                   = Namespace("https://www.vast-project.eu/vast#")
VAST_GRAPH_OWNER: URIRef         = URIRef(f"{NAMESPACE_VAST.vastGraphObjectOwner}/ellogon_annotation_tool")
GRAPH_ID_ELLOGON_ANNOTATION_TOOL = URIRef("https://www.vast-project.eu/vastOntology/EllogonAnnotationTool")

@dataclass
class RDFStoreObject:
    type:            URIRef  = None
    id:              URIRef  = None
    name:            Literal = None
    text:            Literal = None
    comment:         Literal = None
    value:           Literal = None
    created_at:      Literal = None
    updated_at:      Literal = None
    created_by:      URIRef  = None
    updated_by:      URIRef  = None
    start:           Literal = None
    end:             Literal = None
    x:               Literal = None
    y:               Literal = None
    width:           Literal = None
    height:          Literal = None
    span_type:       Literal = None
    rdf_graph_owner: Literal = VAST_GRAPH_OWNER

    def add(self, graph):
        if (self.id == None):
            return
        if (self.rdf_graph_owner): graph.add((self.id, NAMESPACE_VAST.vastGraphObjectOwner,  self.rdf_graph_owner))
        if (self.type):        graph.add((self.id, RDF.type,  self.type))
        if (self.name):        graph.add((self.id, FOAF.name, self.name))
        #if (self.text):       graph.add((self.id, NAMESPACE_VAST.vastText, self.text))
        if (self.comment):     graph.add((self.id, RDFS.comment, self.comment))
        if (self.value):       graph.add((self.id, NAMESPACE_VAST.vastKeyword, self.value))
        if (self.created_at):  graph.add((self.id, NAMESPACE_VAST.vastCreatedAt, self.created_at))
        if (self.updated_at):  graph.add((self.id, NAMESPACE_VAST.vastUpdatedAt, self.updated_at))
        if (self.created_by):  graph.add((self.id, NAMESPACE_VAST.vastCreatedBy, self.created_by))
        if (self.updated_by):  graph.add((self.id, NAMESPACE_VAST.vastUpdatedBy, self.updated_by))
        if (self.span_type):   graph.add((self.id, NAMESPACE_VAST.vastSegmentType, self.span_type))
        if (self.start):       graph.add((self.id, NAMESPACE_VAST.vastSegmentStart, self.start))
        if (self.end):         graph.add((self.id, NAMESPACE_VAST.vastSegmentEnd, self.end))
        if (self.x):           graph.add((self.id, NAMESPACE_VAST.vastSegmentX, self.x))
        if (self.y):           graph.add((self.id, NAMESPACE_VAST.vastSegmentY, self.y))
        if (self.width):       graph.add((self.id, NAMESPACE_VAST.vastSegmentWidth, self.width))
        if (self.height):      graph.add((self.id, NAMESPACE_VAST.vastSegmentHeight, self.height))

class RDFStoreConfig:
    def __init__(self, env=".env"):
        self.config = {
            **dotenv_values(env),  # load sensitive variables from .env file
            **os.environ,          # override loaded values with environment variables
        }

class RDFStoreVAST:

    def __init__(self, config=None, identifier=GRAPH_ID_ELLOGON_ANNOTATION_TOOL, store=None):
        self.default_config(config)
        self.default_store(store)
        self.g = Graph(store=self.store, identifier=identifier)
        self.vast = NAMESPACE_VAST
        self.g.bind("vast", self.vast)

        self.owner = RDFStoreObject(type=self.vast.vastGraphObjectOwner,
                                    id=VAST_GRAPH_OWNER)
        self.owner.add(self.g)
        self.commit()

    def default_config(self, config):
        if not config:
            config = RDFStoreConfig()
        self.config = config

    def default_store(self, store):
        if not store and self.config:
            store = SPARQLUpdateStore(query_endpoint=self.config.config["GRAPHDB_QUERY_ENDPOINT"],
                                      update_endpoint=self.config.config["GRAPHDB_UPDATE_ENDPOINT"],
                                      auth=(self.config.config["GRAPHDB_AUTH_USER"],
                                            self.config.config["GRAPHDB_AUTH_PASS"]),
                                      autocommit=False,
                                      context_aware=True,
                                      postAsEncoded=False
                                     )
            # Default is 'GET'. We want to send 'POST' requests in this instance.
            store.method = 'POST'
        self.store = store

    def commit(self):
        if self.store:
            self.store.commit()


    def serialiseCollection(self, collection):
        obj = RDFStoreObject(type=self.vast.vastCollection,
                             id=URIRef(f"{self.vast.vastCollection}/{collection.id}"),
                             name=Literal(collection.name, lang="en"))
        total_anns = 0
        collection_serialised = False;
        for doc in collection.documents():
            dobj, anns = self.serialiseDocument(collection, doc)
            if anns > 0:
                if not collection_serialised:
                    obj.add(self.g)
                    collection_serialised = True

                self.g.add( (dobj.id, RDFS.member, obj.id) )
                total_anns += anns
            self.commit()
        return obj, total_anns

    def serialiseDocument(self, collection, document):
        anns = list(document.annotationsByType('VAST_value'))
        print(f"    Document id: '{document.id}', anns: {len(anns)}, name: '{document.name}'")
        # Generate expert objects...
        cbobj = self.serialiseVastExpert(document.owner_email)
        if cbobj: cbobj.add(self.g)
        ubobj = self.serialiseVastExpert(document.updated_by)
        if ubobj: ubobj.add(self.g)


        ## Simulate how codemirror handles lines...
        text_cm = "\n".join(document.text.splitlines())

        obj = RDFStoreObject(type=self.vast.vastDocument,
                             id=URIRef(f"{self.vast.vastDocument}/{document.id}"),
                             name=Literal(document.name, lang="en"),
                             text=Literal(text_cm, lang="en"),
                             created_by=cbobj.id if cbobj else cbobj,
                             updated_by=ubobj.id if ubobj else ubobj,
                            )
        if len(anns) < 1:
            return obj, 0
        obj.add(self.g)
        count = 0
        for ann in anns:
            ann_obj = self.serialiseAnnotation(collection, document, ann)
            self.g.add( (obj.id, self.vast.vastAnnotation, ann_obj.id) )
            count += 1
            if count % 30 == 0:
                self.commit()
        return obj, len(anns)

    def serialiseAnnotation(self, collection, document, annotation):
        # print(annotation)
        # Get the type attribute...
        value = annotation.attributeGet('type')
        if value != None:
            value = value.value
            # make sure, value does not have spaces!
            value = value.lower().replace(' ', '_')
        # Generate a keyword object...
        kobj = RDFStoreObject(type=self.vast.vastKeyword,
                             id=URIRef(f"{self.vast.vastKeyword}/{value}"),
                             comment=Literal(value, lang="en"))
        kobj.add(self.g)
        # Generate expert objects...
        cbobj = self.serialiseVastExpert(annotation.created_by)
        if cbobj: cbobj.add(self.g)
        ubobj = self.serialiseVastExpert(annotation.updated_by)
        if ubobj: ubobj.add(self.g)


        obj = RDFStoreObject(type=self.vast.vastAnnotation,
                             id=URIRef(f"{self.vast.vastAnnotation}/{annotation._id}"),
                             comment=Literal(annotation.type, lang="en"),
                             value=kobj.id,
                             created_at=self.serialiseDateTime(annotation.created_at),
                             updated_at=self.serialiseDateTime(annotation.updated_at),
                             created_by=cbobj.id if cbobj else cbobj,
                             updated_by=ubobj.id if ubobj else ubobj,
                            )
        obj.add(self.g)

        for span in annotation.spans:
            # if span.start < 0:
            #     continue
            span_obj = self.serialiseAnnotationSpan(collection, document, annotation, span)
            self.g.add( (obj.id, self.vast.vastSegment, span_obj.id) )
        return obj

    def serialiseAnnotationSpan(self, collection, document, annotation, span):
        match span.type:
            case 'rect':
                obj = RDFStoreObject(type=self.vast.vastSegmentRectange,
                                     id=URIRef(f"{self.vast.vastSegemntRectange}/{annotation._id}/{span.x}-{span.y}-{span.width}-{span.height}"),
                                     span_type=Literal(span.type, lang="en"),
                                     x=Literal(span.x,           datatype=XSD.integer),
                                     y=Literal(span.y,           datatype=XSD.integer),
                                     width=Literal(span.width,   datatype=XSD.integer),
                                     height=Literal(span.height, datatype=XSD.integer),
                                    )
            case _:
                obj = RDFStoreObject(type=self.vast.vastSegment,
                                     id=URIRef(f"{self.vast.vastSegemnt}/{annotation._id}/{span.start}-{span.end}"),
                                     comment=Literal(span.segment, lang="en"),
                                     span_type=Literal("text", lang="en"),
                                     start=Literal(span.start, datatype=XSD.integer),
                                     end=Literal(span.end,     datatype=XSD.integer),
                                    )
        obj.add(self.g)
        return obj

    def serialiseVastExpert(self, email):
        if email:
            return RDFStoreObject(type=self.vast.vastExpert,
                                  id=URIRef(f"{self.vast.vastExpert}/{hashlib.md5(email.encode('utf-8')).hexdigest()}"),
                                   comment=Literal(email, lang="en"))
        else:
            return None

    def serialiseDateTime(self, dt):
        if dt.find("T") < 0:
            dt = dt.replace(" ", "T", 1)
        return Literal(dt, datatype=XSD.dateTime)

    def serialiseCollections(self, collections):
        for col in collections:
            print(f"  Collection id: '{col.id}', name: '{col.name}'")
            self.serialiseCollection(col)

    def retrieveAndSerialiseCollections(self):
        # Login as a user, and create a session to have access to the annotation tool data...
        session = Session(username=self.config.config["ANNTOOL_AUTH_USER"],
                          password=self.config.config["ANNTOOL_AUTH_PASS"],
                          URL=self.config.config["ANNTOOL_HOST"]);
    
        collections = session.collections()
        self.serialiseCollections(collections)
        # rdf.g.serialize(destination="EllogonAnnotationToolData.xml", format='xml')
        session.logout()
        self.commit()

