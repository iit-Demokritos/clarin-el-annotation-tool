<?php

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DocumentController extends \BaseController
{

  protected $fillable = ['name', 'owner_id', 'handler'];

  //get all the documents of the user
  public function index($collection_id)
  {
    try {
      $user = Sentinel::getUser();
      return Response::json([
        'success' => true,
        'data'    => DB::table('documents')
          ->leftJoin('users', 'documents.owner_id', '=', 'users.id')
          ->leftJoin('shared_collections', 'documents.collection_id', '=', 'shared_collections.collection_id')
          ->where('documents.collection_id', $collection_id)
          /*->where(function($query) use ($user) {
                          $query->where('open_documents.user_id', '=', $user['id'])
                                ->orWhere(function($query) use ($user) {
                                  $query->where('shared_collections.from', '=', $user['email'])
                                      ->where('shared_collections.confirmed', '=', 1);
                                })
                                ->orWhere(function($query) use ($user) {
                                  $query->where('shared_collections.to', '=', $user['email'])
                                      ->where('shared_collections.confirmed', '=', 1);
                                });
                         })*/
          ->where(function ($query) use ($user) {
            $query->where('documents.owner_id', '=', $user['id'])
              ->orWhere(function ($query) use ($user) {
                $query->where('shared_collections.from', '=', $user['email'])
                  ->where('shared_collections.confirmed', '=', 1);
              })
              ->orWhere(function ($query) use ($user) {
                $query->where('shared_collections.to', '=', $user['email'])
                  ->where('shared_collections.confirmed', '=', 1);
              });
          })
          ->distinct()
          ->get(['documents.*', 'users.email as owner_email'])
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  //get the specific document of the user
  public function show($collection_id, $document_id)
  {
    try {
      $user = Sentinel::getUser();

      $is_opened = DB::table('open_documents')
        ->leftJoin('shared_collections', 'open_documents.collection_id', '=', 'shared_collections.collection_id')
        ->where('open_documents.collection_id', (int)$collection_id)
        ->where('open_documents.document_id', (int)$document_id)
        ->where('open_documents.db_interactions', '>', 0)
        ->where(function ($query) use ($user) {
          $query->where('open_documents.user_id', '=', $user['id'])
            ->orWhere(function ($query) use ($user) {
              $query->where('shared_collections.from', '=', $user['email'])
                ->where('shared_collections.confirmed', '=', 1);
            })
            ->orWhere(function ($query) use ($user) {
              $query->where('shared_collections.to', '=', $user['email'])
                ->where('shared_collections.confirmed', '=', 1);
            });
        })
        ->count();

      $document = Document::where('collection_id', (int)$collection_id)
        ->where('id', (int)$document_id)
        ->first();

      if ($is_opened > 0)    //if document is opened from other user, append the appropriate flag
        $document['is_opened'] = true;
      else
        $document['is_opened'] = false;

      return Response::json([
        'success' => true,
        'data'     => $document
      ]);
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    /*return Response::json(array('success' => true));*/
  }

  public function store()
  {
    try {
      DB::transaction(function () {
        $duplicateCounter = -1;
        $unique_identifier = 1;

        $input = Request::input('data');
        $document_name = $input['name'];

        $user = Sentinel::getUser();

        /* Caller will always place data in the "text" field */
        $data         = $input['text'];
        $type         = strtolower($input['type'] ?? "text");
        $handler_type = $input['handler']['value'] ?? NULL;
        $handler_name = $input['handler']['name'] ?? NULL;
        $text         = "";
        $data_text    = NULL;
        $data_binary  = NULL;
        $visualisation_options = NULL;
        switch ($type) {
          case "tei xml":
          case "text":
          default:
            $binary = False;
            break;
        };

        /* Apply handler... */
        switch (strtolower($handler_type)) {
          case "none":
            $text = $data;
            break;
          default:
            $json = Http::post('https://annotation.ellogon.org/api/fileoperation/handler/apply/', [
              'type' => $handler_type,
              'handler_name' => $handler_name,
              'binary_file' => $data
            ])->throw()->json();
            if ($binary) {
              $data_binary = $data;
            } else {
              $data_text = $data;
            }
            $text = $json['documents'][0]['text'] ?? "";
            $visualisation_options = json_encode($json['documents'][0]['marks']) ?? NULL;
            break;
        };

        DB::unprepared('LOCK TABLE documents WRITE');
        do {
          $duplicateCounter = DB::table('documents')
            ->where('name', '=',  $document_name)
            ->where('collection_id', '=',  $input['collection_id'])
            ->count();

          if ($duplicateCounter > 0) {
            $document_name = $input['name'] . "_" . $unique_identifier;
            $unique_identifier++;
          }
        } while ($duplicateCounter != 0);

        $col = Document::create([
          'name' => $document_name,
          'type' => $type,
          'text' => $text,
          'data_text' => $data_text,
          'data_binary' => $data_binary,
          'handler' => $handler_type,
          'visualisation_options' => $visualisation_options,
          'external_name' => $document_name,
          'encoding' => $input['encoding'],
          'collection_id' => $input['collection_id'],
          'owner_id' => $user['id'],
          'updated_by' => $user['email']
        ]);

        DB::unprepared('COMMIT');
        DB::unprepared('UNLOCK TABLES');
      });
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  public function destroy($collection_id, $document_id)
  {
    try {
      $user = Sentinel::getUser();
      $document = Document::where('owner_id', $user['id'])      //check if the user is the owner of the document
        ->where('collection_id', $collection_id)
        ->where('id', $document_id)
        ->get();

      if (count($document) > 0) {                    //if the user is the owner of the document, delete it
        Document::where('owner_id', $user['id'])
          ->where('collection_id', $collection_id)
          ->where('id', $document_id)
          ->delete();
      } else                              //else stop the excecution informing the user about the permission issue
        return Response::json(['success' => false, 'message' => 'You do not have permission to delete this document']);

      TempAnnotation::where('owner_id', $user['id'])
        ->where('collection_id', $collection_id)
        ->where('document_id', $document_id)
        ->delete();

      Annotation::where('owner_id', $user['id'])
        ->where('collection_id', $collection_id)
        ->where('document_id', $document_id)
        ->delete();
    } catch (\Exception $e) {
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }
}
