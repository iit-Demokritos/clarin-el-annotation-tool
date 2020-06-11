<?php

class CollectionController extends \BaseController {
	//protected $fillable = array('name', 'owner_id', 'handler');

	//get all collections of user
	public function index() {
		try {
			$user = Sentinel::getUser();
			return Response::json(array(
									'success' => true,
								  	'data'	  => DB::table('collections')
									               ->leftJoin('documents', 'collections.id', '=', 'documents.collection_id')
									               ->leftJoin('shared_collections', 'collections.id', '=', 'shared_collections.collection_id')
												   ->where('collections.owner_id', '=', $user['id'])
										           ->orWhere(function($query) use ($user) {
										                $query->where('shared_collections.to', '=', $user['email'])
										                      ->where('shared_collections.confirmed', '=', 1);
										           	})
									               ->select(DB::raw('collections.id, collections.name, collections.encoding, collections.owner_id, shared_collections.confirmed, count(documents.id) as document_count, IF('.$user['id']. '=collections.owner_id, true, false) as is_owner'))
									               ->orderBy('collections.id', 'asc')
									               ->groupBy('collections.id')
									               ->get()));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}


	//get all collections data
	public function showData() {
		try {
			$user = Sentinel::getUser();
			return Response::json(array(
									'success' => true,
								  	'data'	  => DB::table('collections')
								  	               ->leftJoin('documents', 'collections.id', '=', 'documents.collection_id')
            									   ->leftJoin('shared_collections', 'collections.id', '=', 'shared_collections.collection_id') 	// addition
            									   ->where('collections.owner_id', '=', $user['id'])
										           ->orWhere(function($query) use ($user) {
										                $query->where('shared_collections.to', '=', $user['email'])
										                      ->where('shared_collections.confirmed', '=', 1);
										           	})
										           ->select('documents.id', 'documents.name', 'documents.collection_id', 'collections.name as collection_name', 'collections.owner_id','shared_collections.confirmed', DB::raw('IF('.$user['id']. '=collections.owner_id, true, false) as is_owner'))
            									   ->orderBy('collection_name', 'asc')->orderBy('name', 'asc')
            									   ->get()));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}



	//get all collections data
	public function exportData($collection_id) {
		try {
			//get the specified collection
			$collection = Collection::where('collections.id', '=', $collection_id)
		   							->firstOrFail();

			//get the documents of the collection
		 	$documents = Document::where('collection_id', $collection_id)
			 			   		  ->get(array('id', 'name', 'text', 'external_name','encoding','version', 'created_at', 'updated_at'));

			//iterate through the documents of the collection and get its annotations
			foreach ($documents as $value) {
				$annotations = Annotation::where('collection_id', (int) $collection_id)
										 ->where('document_id', (int) $value->id)
										 ->get(array('collection_id', 'document_id', 'type', 'spans', 'attributes'));

			 	$value->annotations=$annotations;
		   	}

		   	$collection->documents = $documents;

			return Response::json(array('success' => true,
										'message' => "ok",
								  		'data'	  => $collection));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage(), 'data' => []));
		}
	}

	//get selected collection of user
	public function show($collection_id) {
		try {
			$user = Sentinel::getUser();
			return Response::json(array(
									'success' => true,
									'data'	  => Collection::where('owner_id', $user['id'])
														   ->where('id', $collection_id)
														   ->get()));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}

	//store a new collection
	public function store() {
		$newCollection;
		try {
			$input = Request::input('data');

			DB::unprepared('LOCK TABLES collections WRITE');
			$user = Sentinel::getUser();
			$duplicateCollection = DB::table('collections')
									 ->where('owner_id', '=',  $user['id'])
									 ->where('name', '=',  $input['name'])
									 ->get();

			if (empty($duplicateCollection)){ 			//collection does not exist	-- save new collection
				$newCollection = Collection::create(array(
					'name' => $input['name'],
					'encoding' => $input['encoding'],
					'owner_id' => $user['id'],
					'handler' => $input['handler']
				));

				DB::unprepared('COMMIT');
				DB::unprepared('UNLOCK TABLES');
				return Response::json(array('success' => true,
											'collection_id' => $newCollection->id,
											'exists'  => false));
			} elseif (!empty($duplicateCollection) && $input['overwrite']=='true'){ 	//collection exists -- overwrite
				Collection::destroy($input['id']);	//destroy the old collection
				$newCollection = Collection::create(array(	//add new collection
					'name' => $input['name'],
					'encoding' => $input['encoding'],
					'owner_id' => $user['id'],
					'handler' => $input['handler']
				));

				DB::unprepared('COMMIT');
				DB::unprepared('UNLOCK TABLES');
				return Response::json(array('success' => true,
											'collection_id' => $newCollection->id,
											'exists'  => false));
			} else {		//collection exists -- query for overwrite
				DB::unprepared('UNLOCK TABLES');
				return Response::json(array('success' => true,
											'exists'  => true,
											'collection_id' => $duplicateCollection[0]->id));
			}
		}catch(\Exception $e){
    		return Response::json(array('success' => false,
    									'exists'  => false,
    									'message' => $e->getMessage()));
		}
	}

	//rename a collection
	public function update($collection_id) {
		try {
			$input = Request::input('data');

			DB::unprepared('LOCK TABLES collections WRITE');
			$user = Sentinel::getUser();
			$duplicateCollection = DB::table('collections')
								/*->where('owner_id', '=',  $user['id'])*/
								->where('name', '=',  $input['name'])
								->get();

			if (empty($duplicateCollection)) { 			//collection name does not exist	-- update collection
				$collection = Collection::find($collection_id);
				$collection->name = $input['name'];
				$collection->save();

				DB::unprepared('COMMIT');
				DB::unprepared('UNLOCK TABLES');

				return Response::json(array('success' => true,
    										'exists'  => false));
			} else {
				DB::unprepared('UNLOCK TABLES');
				return Response::json(array('success' => true,
    										'exists'  => true,
    										'flash'	  => 'The name you selected already exists. Please select a new name'));
			}
		}catch(\Exception $e){
    		return Response::json(array('success' => false,
    									'exists'  => false,
    									'message' => $e->getMessage()));
		}
	}

	//destroy a collection and its annotations
	public function destroy($collection_id) {
		try {
			$user = Sentinel::getUser();
			$collection = Collection::where('owner_id', $user['id'])		//check if the user is the owner of the collection
					  	->where('id', $collection_id)
					  	->get();

			if (count($collection)>0){										//if the user is the owner of the collection, delete it
				Collection::where('owner_id', $user['id'])
					  	  ->where('id', $collection_id)
					      ->delete();
			} else 															//else stop the excecution informing the user about the permission issue
				return Response::json(array('success' => false, 'message' => 'You do not have permission to delete this collection'));

			TempAnnotation::where('owner_id', $user['id'])
					  	  ->where('collection_id', $collection_id)
						  ->delete();

			Annotation::where('owner_id', $user['id'])
				  	  ->where('collection_id', $collection_id)
					  ->delete();
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}

		return Response::json(array('success' => true));
	}
}
