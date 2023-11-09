import { Injectable, OnInit } from '@angular/core';
import { CollectionService } from 'src/app/services/collection-service/collection-service.service';
import { DocumentService } from 'src/app/services/document-service/document.service';
import { AnnotationService } from '../annotation-service/annotation.service';

@Injectable({
  providedIn: 'root'
})
export class CollectionImportService implements OnInit {

  ObjectID;
  collectionData: any = {};
  collectionKeys = ['encoding', 'handler', 'created_at', 'updated_at'];
  documentKeys = [/*'annotations',*/
    'name', 'external_name',
    'text', 'type',
    'data_text', 'data_file', 'data_image', 'data_url',
    'visualisation_options', 'metadata',
    'encoding', 'handler',
    'created_at', 'updated_at',
    'version', 'updated_by'
    ];

  constructor(
    public collectionService: CollectionService,
    public documentService: DocumentService,
    public annotationService: AnnotationService
  ) {
    /* WARNING: annotation ids must be created the same way as in
     * components, which inherit BaseControlComponent
     * (app/components/controls/base-control/base-control.component.ts). */
    this.ObjectID = require("bson-objectid");
  }

  ObjectId() {
    return this.ObjectID();
  }

  ngOnInit() {
    this.collectionData = {};
    this.collectionData.name = "";
    this.collectionData.encoding = "";
    this.collectionData.handler = "";
  }

  // Read file contents from disk. Expects ..
  readFile(documentFile) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = function () {
        let data = reader.result;
        resolve(data);
      };
      reader.readAsText(documentFile.file);
    });
  }; /* readFile */

  readFiles(documentFiles) {
    return new Promise<string[]>((resolve, reject) => {
      var promises = [];
      documentFiles.forEach(element => {
        promises.push(this.readFile(element));
      });
      Promise.all(promises)
      .then((files) => {
        resolve(files);
      }, (error) => {
        reject(error);
      });
    });
  }; /* readFiles */

  readJSONFiles(documentFiles) {
    return new Promise((resolve, reject) => {
      this.readFiles(documentFiles).then((files: string[]) => {
        var filesJSON = []
        files.forEach((file) => {
          filesJSON.push(JSON.parse(file));
        });
        resolve(filesJSON);
      }, (error) => {
        reject(error);
      });
    });
  }; /* readJSONFiles */

  exists(collectionName) {
    return this.collectionService.exists(collectionName);
  }; /* exists */

  importFiles(collectionName, documents,
    overwrite: boolean = false, collectionId = undefined) {
    return new Promise((resolve, reject) => {
      // Create promises to read files
      var promises = [];

      documents.forEach(element => {
        promises.push(this.readFile(element));
      });

      // Read the files
      Promise.all(promises)
        .then((files) => {
          this.importJSON(
            collectionName, files, overwrite, collectionId)
            .then((response) => {
              resolve(response);
            }, (error) => {
              reject(error);
            });
          // Send files to the import route
          // this.http.post('api/collections/import', {
          //   name: collectionName,
          //   files: files
          // }).subscribe((data) => {
          //   resolve(data);
          // }, (error) => {
          //   reject(error);
          // });
        }, (error) => {
          reject(error);
        });
    });
  }

  extractCollectiondData(json_data, collectionData = {}) {
    this.collectionKeys.forEach((key) => {
      collectionData[key] = json_data[key];
    });
    return collectionData;
  }; /* extractCollectiondData */

  extractDocumentdData(json_data, documentData = {}) {
    this.documentKeys.forEach((key) => {
      documentData[key] = json_data[key];
    });
    // IMPORTANT: Change annotations' _id, or else they will
    // overwite the original ones when saved!
    var annotations = [];
    json_data['annotations'].forEach((ann) => {
      ann['_id'] = this.ObjectId().toString();
      annotations.push(ann);
    });
    documentData['annotations'] = annotations;
    return documentData;
  }; /* extractDocumentdData */

  importJSON(name, files: string[], overwrite: boolean = false, collectionId = undefined) {
    this.collectionData.name = name;
    this.collectionData.overwrite = overwrite;
    if (overwrite && collectionId != undefined) {
      this.collectionData.id = collectionId;
    }
    var documents = [];
    var index = 0;
    files.forEach((file) => {
      var data = JSON.parse(file);
      if (index == 0) {
        // Collect Collection info...
        this.collectionKeys.forEach((key) => {
          this.collectionData[key] = data.data[key];
        });
      }
      if (data.data.documents.length > 0) {
        data.data.documents.forEach((document) => {
          var doc = {};
          this.documentKeys.forEach((key) => {
            doc[key] = document[key];
          });
          // IMPORTANT: Change annotations' _id, or else they will
          // overwite the original ones when saved!
          var annotations = [];
          document['annotations'].forEach((ann) => {
            ann['_id'] = this.ObjectId().toString();
            annotations.push(ann);
          });
          doc['annotations'] = annotations;
          documents.push(doc);
        });
      }
      index += 1;
    });
    return this.saveCollection(this.collectionData, documents);
  }; /* importJSON */

  saveCollection(collectionData, documents) {
    // console.error(collectionData, documents);
    return new Promise((resolve, reject) => {
      this.collectionService.save(collectionData)
        .then((response) => {
          if (response["success"]) {
            var collectionId = response['collection_id'];
            // console.error("CollectionImportService: saveCollection():", collectionId, response);
            this.saveDocuments(collectionId, documents)
              .then((data) => {
                resolve(data);
              }, (error) => {
                reject(error);
              });
          } else {
            // TODO: return an error message
            reject(response);
          }
        }, (error) => {
          reject(error);
        }); /* then */
    }); /* new Promise */
  }; /* saveCollection */

  saveDocuments(collectionId, docs) {
    var promises: any = [];
    docs.forEach(doc => {
      promises.push(new Promise<any>((resolve, reject) => {
        this.documentService.saveDocument(collectionId, doc)
          .then((response) => {
            //console.error("CollectionImportService: saveDocument():", response);
            if (response["success"]) {
              var documentId = response['data']['document_id'];
              this.saveAnnotations(collectionId, documentId, doc.annotations)
                .then((response) => {
                  if (response["success"]) {
                    resolve(response);
                  } else {
                    reject(response);
                  }
                }, (error) => {
                  reject(error);
                });
              // resolve(response);
            } else {
              reject(response);
            }
          }, (error) => {
            console.error("CollectionImportService: saveDocuments(): Error:", error);
            reject(error);
          });
      }));
    });
    return Promise.all(promises);
  }; /* saveDocuments */

  saveAnnotations(collectionId, documentId, anns) {
    // console.error("CollectionImportService: saveAnnotations(): anns:", anns, collectionId, documentId);
    return this.annotationService.import(collectionId, documentId, anns);
  }; /* saveAnnotations */
}
