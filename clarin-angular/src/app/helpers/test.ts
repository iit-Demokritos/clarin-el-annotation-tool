import { diffAnnotationSets } from './annotation';
import { Annotation } from '../models/annotation';
import { Span } from '../models/span';

var annotations1 = [
          {
            "_id": "61cb811efbb75d61a92f5bff",
            "collection_id": 233,
            "document_id": 3709,
            "owner_id": 7,
            "type": "VAST_value",
            "spans": [
              {
                "segment": "Ενα",
                "start": 0,
                "end": 3
              }
            ],
            "attributes": [
              {
                "name": "type",
                "value": "democracy"
              }
            ],
            "created_by": "petasisg@gmail.com",
            "updated_by": "petasisg@gmail.com",
            "created_at": "2021-12-28T23:26:54.163000",
            "annotator_id": "Button_Annotator_neutral_VAST_value_type_Generic",
            "updated_at": "2021-12-28T23:29:54.145"
          },
          {
            "_id": "61cb8137fbb75d61a92f5c00",
            "collection_id": 233,
            "document_id": 3709,
            "owner_id": 7,
            "type": "VAST_value",
            "spans": [
              {
                "segment": "φαινομενικά",
                "start": 17,
                "end": 28
              }
            ],
            "attributes": [
              {
                "name": "type",
                "value": "dialogue"
              }
            ],
            "created_by": "petasisg@gmail.com",
            "updated_by": "petasisg@gmail.com",
            "created_at": "2021-12-28T23:27:19.080000",
            "annotator_id": "Button_Annotator_neutral_VAST_value_type_Generic",
            "updated_at": "2021-12-28T23:29:54.146"
          },
          {
            "_id": "61cb813efbb75d61a92f5c01",
            "collection_id": 233,
            "document_id": 3709,
            "owner_id": 7,
            "type": "VAST_value",
            "spans": [
              {
                "segment": "διαζύγιο",
                "start": 35,
                "end": 43
              }
            ],
            "attributes": [
              {
                "name": "type",
                "value": "equality"
              }
            ],
            "created_by": "petasisg@gmail.com",
            "updated_by": "petasisg@gmail.com",
            "created_at": "2021-12-28T23:27:26.042000",
            "annotator_id": "Button_Annotator_neutral_VAST_value_type_Generic",
            "updated_at": "2021-12-28T23:29:54.148"
          },
          {
            "_id": "61cb8149fbb75d61a92f5c02",
            "collection_id": 233,
            "document_id": 3709,
            "owner_id": 7,
            "type": "VAST_value",
            "spans": [
              {
                "segment": "Πάνου",
                "start": 55,
                "end": 60
              }
            ],
            "attributes": [
              {
                "name": "type",
                "value": "freedom"
              }
            ],
            "created_by": "petasisg@gmail.com",
            "updated_by": "petasisg@gmail.com",
            "created_at": "2021-12-28T23:27:37.720000",
            "annotator_id": "Button_Annotator_neutral_VAST_value_type_Generic",
            "updated_at": "2021-12-28T23:29:54.148"
          }
        ];

var annotations2 = [
          {
            "_id": "61cb819bfbb75d61a92f5c03",
            "collection_id": 233,
            "document_id": 3710,
            "owner_id": 7,
            "type": "VAST_value",
            "spans": [
              {
                "segment": "Ενα",
                "start": 0,
                "end": 3
              }
            ],
            "attributes": [
              {
                "name": "type",
                "value": "democracy"
              }
            ],
            "created_by": "petasisg@gmail.com",
            "updated_by": "petasisg@gmail.com",
            "created_at": "2021-12-28T23:28:59.222000",
            "annotator_id": "Button_Annotator_neutral_VAST_value_type_Generic",
            "updated_at": "2021-12-28T23:29:51.080"
          },
          {
            "_id": "61cb81a0fbb75d61a92f5c04",
            "collection_id": 233,
            "document_id": 3710,
            "owner_id": 7,
            "type": "VAST_value",
            "spans": [
              {
                "segment": "διαζύγιο",
                "start": 35,
                "end": 43
              }
            ],
            "attributes": [
              {
                "name": "type",
                "value": "dialogue"
              }
            ],
            "created_by": "petasisg@gmail.com",
            "updated_by": "petasisg@gmail.com",
            "created_at": "2021-12-28T23:29:04.211000",
            "annotator_id": "Button_Annotator_neutral_VAST_value_type_Generic",
            "updated_at": "2021-12-28T23:29:51.081"
          }
        ];

var annotationSets = [annotations2, annotations1, annotations2, annotations1];
//var annotationSets = [annotations2, annotations1];
const util = require('util');

console.log(util.inspect(diffAnnotationSets(annotationSets), {showHidden: false, depth: null, colors: true}));
