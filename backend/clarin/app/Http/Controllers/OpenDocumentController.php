<?php

use Illuminate\Support\Facades\Log;

class OpenDocumentController extends \BaseController
{

  public function index()
  {
    try {
      $user = Sentinel::getUser();
      return Response::json([
        'success' => true,
        'data'    => DB::table('open_documents')
          ->leftJoin('shared_collections', 'open_documents.collection_id', '=', 'shared_collections.collection_id')
          ->select(DB::raw('open_documents.collection_id, open_documents.document_id, open_documents.annotator_type, open_documents.db_interactions, MAX(shared_collections.confirmed) confirmed, open_documents.user_id, IF(' . $user['id'] . '=open_documents.user_id, true, false) as opened'))
          ->groupBy('document_id')
          ->distinct()
          ->get()
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => "index(): " . $e->getMessage() . "|\"" . $user . "\""]);
    }
  }

  public function show($document_id, $annotator_id = null)
  {
    try {
      $user = Sentinel::getUser();
      return Response::json([
        'success' => true,
        'data'    => DB::table('open_documents')
          ->leftJoin('shared_collections', 'open_documents.collection_id', '=', 'shared_collections.collection_id')
          ->where('open_documents.document_id', $document_id)
          ->when($annotator_id, function ($query, $annotator_id) {
            return $query->where('open_documents.annotator_type', $annotator_id);
          })
          ->leftJoin('users', 'open_documents.user_id', '=', 'users.id')
          ->select(DB::raw('open_documents.collection_id, open_documents.document_id, open_documents.annotator_type, open_documents.db_interactions, MAX(shared_collections.confirmed) confirmed, open_documents.user_id, IF(' . $user['id'] . '=open_documents.user_id, true, false) as opened, users.email, users.first_name, users.last_name'))
          ->groupBy('document_id')
          ->get()
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => "show(): " . $e->getMessage()]);
    }
  }

  //open a document
  public function store()
  {
    try {
      $input = Request::input('data');
      $user = Sentinel::getUser();

      $db_interactions = 0;
      if (array_key_exists('db_interactions', $input)) {
        $db_interactions = $input['db_interactions'];
        if ($db_interactions < 0) {
          OpenDocument::where('collection_id', (int)$input['collection_id'])
            ->where('document_id', (int)$input['document_id'])
            ->where('annotator_type', $input['annotator_type'])
            ->update(['db_interactions' => 0]);
          $db_interactions = 0;
        }
      } else {
        // Before inserting a new record store the db_interactions 
        $open_docs = OpenDocument::where('user_id', $user['id'])
          ->where('collection_id', (int)$input['collection_id'])
          ->where('document_id', (int)$input['document_id'])
          ->where('annotator_type', $input['annotator_type'])
          ->first();
        if (!is_null($open_docs)) {
          $db_interactions = $open_docs['db_interactions'];
        }
      }
      // Delete the old entry...
      OpenDocument::where('user_id', $user['id'])
        ->where('collection_id', (int)$input['collection_id'])
        ->where('document_id', (int)$input['document_id'])
        ->where('annotator_type', $input['annotator_type'])
        ->delete();

      $open_document = new OpenDocument;
      $open_document->user_id = $user['id'];
      $open_document->collection_id = $input['collection_id'];
      $open_document->document_id = $input['document_id'];
      $open_document->annotator_type = $input['annotator_type'];
      $open_document->db_interactions = $db_interactions;
      $open_document->save();
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => "store(): " . $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  //close a document
  public function destroy($document_id, $annotator_id)
  {
    try {
      $user = Sentinel::getUser();
      OpenDocument::where('user_id', $user['id'])
        ->where('document_id', (int) $document_id)
        ->when($annotator_id, function ($query, $annotator_id) {
          return $query->where('annotator_type', $annotator_id);
        })
        ->delete();
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => "destroy(): " . $e->getMessage()]);
    }
    return Response::json(['success' => true]);
  }
}
