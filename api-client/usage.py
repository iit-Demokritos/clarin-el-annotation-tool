from api import Session, Collection, Document, Span, Attribute

# Login as a user, and create a session to have access to the data...
session = Session(username="vast.annotator@gmail.com",
                  password="yikbir8",
                  URL='https://vast.ellogon.org/');

# Print all collections...
print("Available Collections:")
collections = session.collections()
for col in collections:
    print(f"    Collection id: '{col.id}', name: '{col.name}'")

# Get the documents of the 1st collection...
print(f"Documents of Collection: {collections[0].name}")
for doc in collections[0].documents():
    print(f"    Document id: '{doc.id}', name: '{doc.name}'")

# Get a Collection by name...
collection = session.collectionGetByName('Godwin, the man in the Moone')
print(f"Documents of Collection: {collection.name}")
for doc in collection.documents():
    print(f"    Document id: '{doc.id}', name: '{doc.name}'")
    # Get the document text...
    text = doc.text
    # print(doc.text)

    # Get the annotations with type "VAST_value"...
    for ann in doc.annotationsByType('VAST_value'):
        print(ann)
        # Get the value of attribute "type"...
        print(f"  Value: {ann.attributeGet('type').value} ({ann._id})")
        # Get the spans...
        for span in ann.spans:
            print(f"  Span: {span}")
            print(f"    Range: [{span.start}-{span.end}]")
            assert text[span.start : span.end] == span.segment
        break

session.logout()
