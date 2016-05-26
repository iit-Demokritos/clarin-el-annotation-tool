<?php

class AnnotationController extends \BaseController { 
    public function __construct() {														//apply filter for the shared/non-shared collections
    	$this->beforeFilter('collection_permissions'); 
    }

	public function index($collection_id, $document_id) {								//get all the annotations
		try {
			return Response::json(array(
									'success' => true,
									'data'	  => Annotation::where('collection_id', (int) $collection_id)
														   ->where('document_id', (int) $document_id)
							   							   ->get(array('collection_id', 'document_id', 'type', 'spans', 'attributes'))));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}

	public function show($collection_id, $document_id, $annotation_id) {				//get all the specific annotation of a document
		try {
			return Response::json(array(
									'success' => true,
									'data'	  => Annotation::find($annotation_id)));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}

	public function store($collection_id, $document_id) {								//store annotations
	    try {
			$user = Sentry::getUser();
			$new_annotations = []; 
			$annotation_data = Input::get('data');

			if ((bool)count(array_filter(array_keys($annotation_data), 'is_string'))) {		//if the user send a single annotation
				$anno = new Annotation(array(	
					'_id' => $annotation_data['_id'],					
					'document_id' => $annotation_data['document_id'],
					'collection_id' => $annotation_data['collection_id'],
					'owner_id' => $user['id'],
					'type' => $annotation_data['type'],
					'spans' => $annotation_data['spans'],
					'attributes' => $annotation_data['attributes']
				));

				$document = Document::find($document_id);
				$document->annotations()->save($anno);
			} else {																		//if the user send an array with annotations
				foreach ($annotation_data as $annotation) {
				    $anno = new Annotation(array(	
						'_id' => $annotation['_id'],					
						'document_id' => $annotation['document_id'],
						'collection_id' => $annotation['collection_id'],
						'owner_id' => $user['id'],
						'type' => $annotation['type'],
						'spans' => $annotation['spans'],
						'attributes' => $annotation['attributes']
					));

				    array_push($new_annotations, $anno);
				}

				$document = Document::find($document_id);				
				$document->annotations()->saveMany($new_annotations);
				OpenDocument::/*where('user_id', $user['id'])
							->*/where('collection_id', (int)$collection_id)
							->where('document_id', (int)$document_id)
							->update(['db_interactions' => 0]);
			}
	    }catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}

		return Response::json(array('success' => true));
	}

	public function destroy($collection_id, $document_id, $annotation_id) {							//destroy annotations
		try {
			$user = Sentry::getUser();
			
			if(is_null($annotation_id) || $annotation_id === 'null'){
				Annotation::/*where('owner_id', $user['id'])
					      ->*/where('collection_id', (int) $collection_id)
					      ->where('document_id', (int) $document_id)
						  ->delete();
			}else {
				Annotation::destroy($annotation_id);
			}
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}

		return Response::json(array('success' => true));
	}
}