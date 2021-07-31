<?php

class AnnotationController extends \BaseController
{

  public $returnProperties = ['_id', 'collection_id', 'document_id', 'owner_id',
    'annotator_id', 'document_attribute',
    'type', 'spans', 'attributes',
    'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at',
    'collection_setting', 'document_setting'
  ];

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
          ->get($this->returnProperties)
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
            ->get($this->returnProperties)
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

  public function store($collection_id, $document_id, $importing=false)
  { //store annotations
    $optional = ['document_attribute', 'collection_setting', 'document_setting'];
    try {
      $user = Sentinel::getUser();
      $new_annotations = [];
      $annotation_data = Request::input('data');
      $annotator_id = "";

      if ((bool)count(array_filter(array_keys($annotation_data), 'is_string'))) { //if the user send a single annotation
        $annotation = $annotation_data;
        // Just make sure during migration, that annotation does not exists
        try {
          Annotation::destroy($annotation['_id']);
        } catch (Throwable $e) {
        }
        $anno = new Annotation([
          '_id' => $annotation['_id'],
          'document_id' => (int)$document_id, // : $annotation['document_id'],
          'collection_id' => (int)$collection_id, // : $annotation['collection_id'],
          'owner_id' => $user['id'],
          'type' => $annotation['type'],
          'spans' => $annotation['spans'],
          'attributes' => $annotation['attributes'],
          'created_by' => array_key_exists('created_by', $annotation) ?
                          $annotation['created_by'] : $user['email'],
          'updated_by' => $importing ? $annotation['updated_by'] ?? $user['email'] : $user['email']
        ]);
        foreach ($optional as $field) {
          if (array_key_exists($field, $annotation)) {
            $anno[$field] = $annotation[$field];
          }
        }
        // 'annotator_id' does not exist in older exports.
        if (isset($annotation['annotator_id'])) {
          $anno['annotator_id'] = $annotation['annotator_id'];
        }
        if (isset($annotation['created_at'])) {
          $anno['created_at'] = $annotation['created_at'];
        }
        if ($importing && isset($annotation['updated_at'])) {
          $anno['updated_at'] = $annotation['updated_at'];
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
            'document_id' => (int)$document_id, // : $annotation['document_id'],
            'collection_id' => (int)$collection_id, // : $annotation['collection_id'],
            'owner_id' => $user['id'],
            'type' => $annotation['type'],
            'spans' => $annotation['spans'],
            'attributes' => $annotation['attributes'],
            'created_by' => array_key_exists('created_by', $annotation) ?
                            $annotation['created_by'] : $user['email'],
            'updated_by' => $importing ? $annotation['updated_by'] ?? $user['email'] : $user['email']
          ]);
          foreach ($optional as $field) {
            if (array_key_exists($field, $annotation)) {
              $anno[$field] = $annotation[$field];
            }
          }
          // 'annotator_id' does not exist in older exports.
          if (isset($annotation['annotator_id'])) {
            $anno['annotator_id'] = $annotation['annotator_id'];
            $annotator_id = $annotation['annotator_id'];
          }
          if (isset($annotation['created_at'])) {
            $anno['created_at'] = $annotation['created_at'];
          }
          if ($importing && isset($annotation['updated_at'])) {
            $anno['updated_at'] = $annotation['updated_at'];
          }
        
          array_push($new_annotations, $anno);
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
      Log::info("AnnotationController - store() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
    return Response::json(['success' => true]);
  } /* store */

  public function import($collection_id, $document_id) {
    return $this->store($collection_id, $document_id, true);
  } /* import */

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
