<?php

class AnnotationController extends \BaseController
{
  public function __construct()
  { //apply filter for the shared/non-shared collections
    //$this->beforeFilter('collection_permissions'); 
  }

  public function index($collection_id, $document_id)
  { //get all the annotations
    try {
      return Response::json([
        'success' => true,
        'data'      => Annotation::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->get(['collection_id', 'document_id', 'annotator_id', 'document_attribute', 'type', 'spans', 'attributes'])
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  public function show($collection_id, $document_id, $annotation_id)
  { //get all the specific annotation of a document
    try {
      if (strpos($annotation_id, '_') !== false) {
        return Response::json([
          'success' => true,
          'data'    => TempAnnotation::where('collection_id', (int) $collection_id)
            ->where('document_id', (int) $document_id)
            ->where('annotator_id', $annotation_id)
            ->get(['collection_id', 'document_id', 'annotator_id', 'document_attribute', 'type', 'spans', 'attributes'])
        ]);
      }
      return Response::json([
        'success' => true,
        'data'      => Annotation::find($annotation_id)
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  public function store($collection_id, $document_id)
  { //store annotations
    $optional = ["document_attribute"];
    try {
      $user = Sentinel::getUser();
      $new_annotations = [];
      $annotation_data = Request::input('data');
      $annotator_id = "";

      if ((bool)count(array_filter(array_keys($annotation_data), 'is_string'))) { //if the user send a single annotation
        // Just make sure during migration, that annotatio does not exists
        try {
          Annotation::destroy($annotation_data['_id']);
        } catch (Throwable $e) {
        }
        $anno = new Annotation([
          '_id' => $annotation_data['_id'],
          'document_id' => $annotation_data['document_id'],
          'collection_id' => $annotation_data['collection_id'],
          'owner_id' => $user['id'],
          'annotator_id' => $annotation_data['annotator_id'],
          'type' => $annotation_data['type'],
          'spans' => $annotation_data['spans'],
          'attributes' => $annotation_data['attributes'],
          'updated_by' => $user['email']
        ]);
        foreach ($optional as $field) {
          if (array_key_exists($field, $annotation_data)) {
            $anno[$field] = $annotation_data[$field];
          }
        }

        $document = Document::find($document_id);
        $document->annotations()->save($anno);
      } else {      //if the user send an array with annotations
        foreach ($annotation_data as $annotation) {
          // Just make sure during migration, that annotation does not exists
          try {
            Annotation::destroy($annotation['_id']);
          } catch (Throwable $e) {
          }
          $anno = new Annotation([
            '_id' => $annotation['_id'],
            'document_id' => $annotation['document_id'],
            'collection_id' => $annotation['collection_id'],
            'owner_id' => $user['id'],
            'annotator_id' => $annotation['annotator_id'],
            'type' => $annotation['type'],
            'spans' => $annotation['spans'],
            'attributes' => $annotation['attributes'],
            'updated_by' => $user['email']
          ]);
          foreach ($optional as $field) {
            if (array_key_exists($field, $annotation)) {
              $anno[$field] = $annotation[$field];
            }
          }

          array_push($new_annotations, $anno);
          $annotator_id = $annotation['annotator_id'];
        }

        $document = Document::find($document_id);
        if (sizeof($new_annotations)) {
          $document->annotations()->saveMany($new_annotations);
          OpenDocument::/*where('user_id', $user['id'])
                          ->*/where('collection_id', (int)$collection_id)
            ->where('document_id', (int)$document_id)
            ->where('annotator_type', $annotator_id)
            ->update(['db_interactions' => 0]);
        }
      }
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  public function destroy($collection_id, $document_id, $annotation_id)
  {  //destroy annotations
    try {
      $user = Sentinel::getUser();

      if (is_null($annotation_id) || $annotation_id === 'null') {
        Annotation::/*where('owner_id', $user['id'])
                   ->*/where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->delete();
      } elseif (strpos($annotation_id, '_') !== false) {
        // We have an annotator id...
        Annotation::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->where('annotator_id', $annotation_id)
          ->delete();
      } else {
        Annotation::destroy($annotation_id);
      }
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }
}
