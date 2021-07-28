<?php

class TempAnnotationController extends \BaseController
{

  public $returnProperties = ['_id', 'collection_id', 'document_id', 'owner_id',
    'annotator_id', 'document_attribute',
    'type', 'spans', 'attributes',
    'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'];

  //apply filter for the shared/non-shared collections 
  public function __construct()
  {
    //$this->middleware('auth');
    //$this->beforeFilter('collection_permissions');
  }

  //get all the temp annotations of a document
  public function index($collection_id, $document_id)
  {
    try {
      return Response::json([
        'success' => true,
        'data'    => TempAnnotation::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->get($this->returnProperties)
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  //get the spacific temp annotations of a document
  public function show($collection_id, $document_id, $annotation_id)
  {
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
        'data'    => TempAnnotation::find($annotation_id)
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  //store a new annotation
  public function store($collection_id, $document_id)
  {
    $optional = ["document_attribute"];
    try {
      $user = Sentinel::getUser();
      $new_annotations = [];
      $annotation_data = Request::input('data');

      if ((bool)count(array_filter(array_keys($annotation_data), 'is_string'))) { //if the user send a single annotation
        $annotation = $annotation;
        $anno = new TempAnnotation([
          '_id' => $annotation['_id'],
          'document_id' => (int)$document_id, //$annotation['document_id'],
          'collection_id' => (int)$collection_id, //$annotation['collection_id'],
          'owner_id' => $user['id'],
          'type' => $annotation['type'],
          'spans' => $annotation['spans'],
          'attributes' => $annotation['attributes'],
          'created_by' => array_key_exists('created_by', $annotation) ?
                          $annotation['updated_by'] : $user['email'],
          'updated_by' => $user['email']
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

        $document = Document::find($document_id);
        $document->temp_annotations()->save($anno);

        OpenDocument::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->where('annotator_type', (array_key_exists('annotator_id', $annotation) ? $annotation['annotator_id'] : null))
          ->increment('db_interactions');
      } else {                                  //if the user send an array with annotations        
        foreach ($annotation_data as $annotation) {
          $anno = new TempAnnotation([
            '_id' => $annotation['_id'],
            'document_id' => (int)$document_id, // $annotation['document_id'],
            'collection_id' => (int)$collection_id, // $annotation['collection_id'],
            'owner_id' => $user['id'],
            'annotator_id' => (array_key_exists('annotator_id', $annotation) ? $annotation['annotator_id'] : null),
            'type' => $annotation['type'],
            'spans' => $annotation['spans'],
            'attributes' => $annotation['attributes'],
            'created_by' => array_key_exists('created_by', $annotation) ?
                            $annotation['created_by'] : $user['email'],
            'updated_by' => $user['email']
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

          array_push($new_annotations, $anno);
        }

        $document = Document::find($document_id);
        $document->temp_annotations()->saveMany($new_annotations);
      }
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  //update specific annotation
  public function update($collection_id, $document_id, $annotation_id)
  {
    $annotation = Request::input('data');
    try {
      $user = Sentinel::getUser();

      $anno = TempAnnotation::find($annotation_id);
      $anno->type = $annotation['type'];
      $anno->spans = $annotation['spans'];
      $anno->attributes = $annotation['attributes'];
      $anno->updated_by = $user['email'];
      $anno->save();

      OpenDocument::where('collection_id', (int) $collection_id)
        ->where('document_id', (int) $document_id)
        ->where('annotator_type', $anno->annotator_id)
        ->increment('db_interactions');
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  //destroy specific annotation
  public function destroy($collection_id, $document_id, $annotation_id)
  {
    try {
      $user = Sentinel::getUser();

      if (is_null($annotation_id) || $annotation_id === 'null') {
        TempAnnotation::withTrashed()
          /*->where('owner_id', $owner['id'])*/
          ->where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->forceDelete();
      } elseif (strpos($annotation_id, '_') !== false) {
        // We have an annotator id...
        TempAnnotation::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->where('annotator_id', $annotation_id)
          ->delete();
        OpenDocument::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->where('annotator_type', $annotation_id)
          ->increment('db_interactions');
      } else {
        $anno = TempAnnotation::find($annotation_id);
        $annotator_id = $anno->annotator_id;
        $anno->delete();
        //TempAnnotation::destroy($annotation_id);

        OpenDocument::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $document_id)
          ->where('annotator_type', $annotator_id)
          ->increment('db_interactions');
      }
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  /**
   * action to handle streamed response from laravel
   * @return \Symfony\Component\HttpFoundation\StreamedResponse
   */
  public function liveUpdate($collection_id, $document_id)
  {
    //set_time_limit(0);

    //$response = new Symfony\Component\HttpFoundation\StreamedResponse();
    //$response->headers->set('Cache-Control', 'no-cache');
    //$response->headers->set('Content-Type', 'text/event-stream');

    //$response->setCallback(


    // Example from https://pineco.de/simple-event-streaming-in-laravel/
    return response()->stream(
      function () use ($collection_id, $document_id) {
        $owner = Sentinel::getUser();
        $elapsed_time = 0;
        $started_time = new DateTime();
        $started_time = $started_time->sub(new DateInterval('PT7S'));  //look for annotations performed 7 seconds ago from now


        $count = 0;
        while (true) {
          if (connection_aborted()) {
            break;
          }
          if ($elapsed_time > 100)    // Cap connections at 100 sec. The browser will reopen the connection on close
            die();

          echo ("event: message\n");
          flush();
          $is_shared = 0;
          $is_owner  = DB::table('collections')
            ->where('id', (int) $collection_id)
            ->where('owner_id', $owner['id'])
            ->count();
          if ($is_owner == 0) {
            $is_shared = DB::table('shared_collections')
              ->where('collection_id', (int) $collection_id)
              ->where('to', $owner['email'])
              ->count();
            if ($is_shared == 0) {
              echo ('data: ' . json_encode('You do not have access to this document. Please select another document.') . "\n\n");    //send data to client
              flush();
            }
          }
          // The collection is owned/shared.
          $started_time_new = new DateTime();
          if ($is_owner == 1 or $is_shared == 1) {
            $new_annotations = TempAnnotation::withTrashed()
              ->where('collection_id', (int) $collection_id)
              ->where('document_id',   (int) $document_id)
              ->where('updated_at', '>=', $started_time)
              ->get($this->returnProperties);
          } else {
            $new_annotations = [];
          }

          // echo("data: [{\"email\": ".json_encode($owner['email']).", \"is_owner\": $is_owner, \"is_shared\": $is_shared, \"len\": ".sizeof($new_annotations).", \"count\": $count}]\n\n");
          //flush();
          if (sizeof($new_annotations) > 0) {
            $started_time = $started_time_new;
            $elapsed_time = 0;
            echo ('data: ' . json_encode($new_annotations) . "\n\n");    //send data to client
            flush();
          } else {
            $elapsed_time += 4;
            echo ('data: ' . json_encode($new_annotations) . "\n\n");    //send data to client
            flush();
            sleep(3);
          }

          $count += 1;
          flush();
          sleep(1);
        }

        //          try {
        //          $elapsed_time = 0;
        //          $started_time = new DateTime();
        //          $started_time = $started_time->sub(new DateInterval('PT7S'));  //look for annotations performed 7 seconds ago from now
        //
        //          while (true) {
        //            echo "event: message\n";
        //            if (connection_aborted()) {
        //                break;
        //            }
        //            if ($elapsed_time>100)    // Cap connections at 100 sec. The browser will reopen the connection on close
        //              die();
        //
        //            $is_owner = DB::table('collections')
        //                    ->where('id', (int) $collection_id) 
        //                    ->where('owner_id', $owner['id'])
        //                    ->count();
        //
        //            if ($is_owner == 0) {
        //               $is_shared = DB::table('shared_collections')
        //                        ->where('collection_id', (int) $collection_id) 
        //                        ->where('to', $owner['email'])
        //                        ->count();
        //
        //            if($is_shared == 0) {
        //               echo('data: ' . json_encode('You do not have access to this document. Please select another document.') . "\n\n");    //send data to client
        //               //ob_flush();
        //               flush();
        //
        //             }
        //          }
        //
        //          $started_time_new = new DateTime();
        //          $new_annotations = TempAnnotation::withTrashed()   
        //                             ->where('collection_id', (int) $collection_id)
        //                             ->where('document_id', (int) $document_id)
        //                             ->where('updated_at', '>=', $started_time)
        //                             ->get(array('_id', 'collection_id', 'document_id', 'type', 'spans', 'attributes', /*'updated_at', 'updated_by',*/'deleted_at'));
        //
        //          if (sizeof($new_annotations)>0) {
        //             $started_time = $started_time_new;
        //             $elapsed_time = 0;
        //
        //             echo 'data: ' . json_encode($new_annotations) . "\n\n";    //send data to client
        //               //ob_flush();
        //               flush();
        //           } else
        //               $elapsed_time += 4;
        //               sleep(3);
        //           }
        //          }
        //          catch (Exception $e) {
        //                  //display custom message
        //             echo "data: {\"msg\": \"". json_encode($e->errorMessage())."\"}\n\n";
        //             flush();
        //          }
        //          flush();
        //          sleep(1);
      },
      200,
      [
        'Cache-Control' => 'no-cache',
        'Content-Type'  => 'text/event-stream',
      ]
    );
    // );

    // return $response;
  }
}
