<?php

use Illuminate\Support\Facades\Log;

class CollectionController extends \BaseController {
  //protected $fillable = array('name', 'owner_id', 'handler');

  //get all collections of user
  public function index() {
    try {
      if (!Sentinel::check()) {
        Log::info("CollectionController - index() - Sentinel::check() failed");
      }
      if (!Auth::check()) {
        Log::info("CollectionController - index() - Auth::check() failed");
      }
      $user = Sentinel::getUser();
      Log::info("CollectionController - index() - user: ".$user);
      return Response::json([
        'success' => true,
        'data'    => DB::table('collections')
          ->leftJoin('documents', 'collections.id', '=', 'documents.collection_id')
          ->leftJoin('shared_collections', 'collections.id', '=', 'shared_collections.collection_id')
          ->where('collections.owner_id', '=', $user['id'])
          ->orWhere(function($query) use ($user) {
            $query->where('shared_collections.to', '=', $user['email'])
                  ->where('shared_collections.confirmed', '=', 1);
          })
          ->select(DB::raw('collections.id, collections.name, collections.encoding, collections.handler, collections.owner_id, shared_collections.confirmed, count(distinct documents.id) as document_count, IF('.$user['id']. '=collections.owner_id, true, false) as is_owner'))
          ->orderBy('collections.id', 'asc')
          ->groupBy('collections.id')
          ->get()]);
    } catch(\Exception $e) {
      Log::info("CollectionController - index() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  //get all collections data
  public function showData() {
    try {
      $user = Sentinel::getUser();
      return Response::json([
        'success' => true,
        'data'    => DB::table('collections')
          ->leftJoin('documents', 'collections.id', '=', 'documents.collection_id')
          ->leftJoin('shared_collections', 'collections.id', '=', 'shared_collections.collection_id')   // addition
          ->where('collections.owner_id', '=', $user['id'])
          ->orWhere(function($query) use ($user) {
            $query->where('shared_collections.to', '=', $user['email'])
                  ->where('shared_collections.confirmed', '=', 1);
          })
          ->select('documents.id', 'documents.name', 'documents.collection_id', 'collections.name as collection_name', 'collections.owner_id', DB::raw('MAX(shared_collections.confirmed) confirmed'), DB::raw('IF(' . $user['id'] . '=collections.owner_id, true, false) as is_owner'))
          ->groupBy('id')
          ->distinct()
          ->orderBy('collection_name', 'asc')
          ->orderBy('name', 'asc')
          ->get()]);
    } catch(\Exception $e) {
      Log::info("CollectionController - showData() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  // Export collection's data
  public function exportData($collection_id) {
    try {
      //get the specified collection
      $collection = Collection::where('collections.id', '=', $collection_id)
        ->firstOrFail();

      //get the documents of the collection
      $documents = Document::where('collection_id', $collection_id)
        ->get(['id', 'name', 'text', 'external_name','encoding','handler', 'version', 'created_at', 'updated_at', 'updated_by', 'type', 'data_binary', 'data_text', 'metadata', 'visualisation_options']);

      //iterate through the documents of the collection and get its annotations
      foreach ($documents as $value) {
        $annotations = Annotation::where('collection_id', (int) $collection_id)
          ->where('document_id', (int) $value->id)
          ->get(['_id', 'collection_id', 'document_id', 'annotator_id', 'type', 'spans', 'attributes', 'updated_by', 'updated_at', 'created_at']);

        $value->annotations=$annotations;
      }

      $collection->documents = $documents;

      return Response::json(['success' => true,
        'message' => "ok",
        'data'    => $collection]);
    } catch(\Exception $e) {
      Log::info("CollectionController - exportData() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage(), 'data' => []]);
    }
  }

  // Import Collection
  public function importData() {
    try {
      $user = Sentinel::getUser();
      $collectionName = Request::input('name');
      $files          = Request::input('files');
      foreach ($files as $file) {
        $json = json_decode(base64_decode($file), true);
        $col = $json['data'];
        $collection = [
          'name'     => $collectionName,
          'encoding' => $col['encoding'],
          'owner_id' => $user['id'],
          'handler'  => $col['handler']
        ];
      }
      $data = [
        'user'   => $user,
        'collection' => $collection,
        'filenu' => count($files)
      ];

      return Response::json([
        'success' => true,
        'data'    => $data]);
    } catch(\Exception $e) {
      Log::info("CollectionController - importData() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  } /* importData */

  //get selected collection of user
  public function show($collection_id) {
    try {
      $user = Sentinel::getUser();
      return Response::json([
        'success' => true,
        'data'    => Collection::where('id', $collection_id)
          // ->where('owner_id', $user['id'])
          ->get()]);
    } catch(\Exception $e) {
      Log::info("CollectionController - show() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  //store a new collection
  public function store() {
    // Log::info('A user has request to store a collection.');
    $newCollection;
    try {
      $input = Request::input('data');
      // Log::info($input);

      $user = Sentinel::getUser();
      // Log::info("User:");
      // Log::info($user);
      $duplicateCollection = DB::table('collections')
        ->where('owner_id', '=',  $user['id'])
        ->where('name', '=',  $input['name'])
         ->get();
      $handler = "none";
      switch (gettype($input['handler'])) {
        case "string":
          $handler = $input['handler'];
          break;
        default:
          if (array_key_exists("value",$input['handler'])) {
            $handler = $input['handler']['value'] ?? "none";
          }
          break;
      };

      if (empty($duplicateCollection) || $duplicateCollection->isEmpty()) {
        //collection does not exist  -- save new collection
        // Log::info("Creating new collection!");
        DB::unprepared('LOCK TABLES collections WRITE');
        try {
          $newCollection = Collection::create([
            'name' => $input['name'],
            'encoding' => $input['encoding'],
            'owner_id' => $user['id'],
            'handler' => $handler
          ]);
          // Log::info("Collection CREATED!");

          // Log::info($newCollection);
          DB::unprepared('COMMIT');
        } catch(\Illuminate\Database\QueryException $e) {
          return Response::json(['success' => false,
            'exists'  => false,
            'message' => $e->getMessage(),
            'user'    => $user]);
        } finally {
          DB::unprepared('UNLOCK TABLES');
        }
        return Response::json(['success' => true,
          'collection_id' => $newCollection->id,
          'exists'  => false]);
      } elseif ($input['overwrite']=='true') {   //collection exists -- overwrite
        Log::info("Collection exists (".$input['id'].")! Deleting & Recreating!");
        DB::unprepared('LOCK TABLES collections WRITE');
        try {
          Collection::destroy($input['id']);  //destroy the old collection
          $newCollection = Collection::create([  //add new collection
            'id'       => $input['id'],
            'name'     => $input['name'],
            'encoding' => $input['encoding'],
            'owner_id' => $user['id'],
            'handler'  => $handler
          ]);

          DB::unprepared('COMMIT');
        } catch(\Illuminate\Database\QueryException $e) {
          return Response::json(['success' => false,
            'exists'  => false,
            'message' => $e->getMessage(),
            'user'    => $user]);
        } finally {
          DB::unprepared('UNLOCK TABLES');
        }
        Log::info("New Collection id: ".$newCollection->id);
        return Response::json(['success' => true,
          'collection_id' => $newCollection->id,
          'exists'  => false]);
      } else {    //collection exists -- query for overwrite
        // Log::info("Collection exists! Query for Overwrite!");
        return Response::json(['success' => true,
          'exists'  => true,
          'collection_id' => $duplicateCollection[0]->id]);
      }
    } catch(\Exception $e) {
      Log::info("CollectionController - store() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false,
        'exists'  => false,
        'message' => $e->getMessage(),
        'user'    => $user]);
    }
  }

  //rename a collection
  public function update($collection_id) {
    // Log::info('A user has request to update a collection.');
    try {
      $input = Request::input('data');

      $user = Sentinel::getUser();
      // Log::info($input);
      DB::unprepared('LOCK TABLES collections WRITE');
      $duplicateCollection = DB::table('collections')
        ->where('owner_id', '=',  $user['id'])
        ->where('name', '=',  $input['name'])
        ->get();

      if (empty($duplicateCollection) || $duplicateCollection->isEmpty()) {
        // collection name does not exist  -- update collection
        $collection = Collection::find($collection_id);
        $collection->name = $input['name'];
        $collection->save();

        DB::unprepared('COMMIT');
        DB::unprepared('UNLOCK TABLES');

        return Response::json(['success' => true,
          'exists'  => false]);
      } else {
        DB::unprepared('UNLOCK TABLES');
        // Log::info("CollectionController - update() - duplicate:");
        // Log::info($duplicateCollection);
        return Response::json(['success' => true,
          'exists'  => true,
          'flash'    => 'The name you selected already exists. Please select a new name']);
      }
    } catch(\Exception $e) {
      Log::info("CollectionController - update() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false,
        'exists'  => false,
        'message' => $e->getMessage()]);
    }
  }

  //destroy a collection and its annotations
  public function destroy($collection_id) {
    Log::info("CollectionController - destroy(".$collection_id.")");
    try {
      $user = Sentinel::getUser();
      Log::info("CollectionController - destroy".$collection_id."): user: ".$user);
      $collection = Collection::where('owner_id', $user['id']) //check if the user is the owner of the collection
        ->where('id', $collection_id)
        ->get();
      log::info("Found: ".count($collection)); 

      if (count($collection) > 0) { //if the user is the owner of the collection, delete it
        Collection::where('owner_id', $user['id'])
          ->where('id', $collection_id)
          ->delete();
      } else {
        //else stop the excecution informing the user about the permission issue
        Log::info("CollectionController - destroy(".$collection_id.", ".$user['id']."): You do not have permission to delete this collection");
        return Response::json(['success' => false, 'message' => 'You do not have permission to delete this collection']);
      }

      TempAnnotation::where('owner_id', $user['id'])
        ->where('collection_id', $collection_id)
        ->delete();

      Annotation::where('owner_id', $user['id'])
        ->where('collection_id', $collection_id)
        ->delete();
    } catch(\Exception $e) {
      Log::info("CollectionController - destroy(".$collection_id.") - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }

  public function exists($collection_name) {
    try {
      $user = Sentinel::getUser();
      // Log::info("User:");
      // Log::info($user);
      $duplicateCollection = DB::table('collections')
        ->where('owner_id', '=',  $user['id'])
        ->where('name',     '=',  $collection_name)
        ->get();

      if (empty($duplicateCollection) || $duplicateCollection->isEmpty()) {
        return Response::json(['success' => true,
                               'exists'  => false]);
      } else {
        return Response::json(['success' => true,
          'exists' => true,
          'flash'  => 'The name you selected already exists. Please select a new name',
          'data'   => $duplicateCollection]);
      }
    } catch(\Exception $e) {
      Log::info("CollectionController - exists() - Catch Exception: ".$e->getMessage());
      return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  } /* exists */
}
