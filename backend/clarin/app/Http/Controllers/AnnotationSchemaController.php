<?php

class AnnotationSchemaController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		try {
			return Response::json(array('success' => true,
										'data'	  => AnnotationSchema::get()));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		try {
			return Response::json(array('success' => true,
										'data'	  => AnnotationSchema::find($id)));
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		try {
			$input = Request::input('data');
			$user = Sentinel::getUser();
				
			$annotationSchema = AnnotationSchema::create(array(
				'xml' => $input['xml'],		
				'owner_id' => $user['id'],	
				'language' => $input['language'],
				'annotation_type' => $input['annotation_type'],		
				'attribute' => $input['attribute'],	
				'alternative' => $input['alternative']
			));

			return Response::json(array('success' => true, 
										'last_id' => $annotationSchema->id));
	    }catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		try {
			AnnotationSchema::destroy($id);
		}catch(\Exception $e){
    		return Response::json(array('success' => false, 'message' => $e->getMessage()));
		}

		return Response::json(array('success' => true));
	}


}
