<?php

class CoreferenceAnnotatorController extends \BaseController {
  public function index() {
    try {
      $user = Sentinel::getUser();
      return Response::json([
                  'success' => true,
                  'data'    => CoreferenceAnnotator::where('user_id', $user['id'])
                                       ->first(['language', 'annotation_type', 'alternative'])]);
    }catch(\Exception $e){
        return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }
  }

  //store an annotation schema
  public function store() {    
    try {
      $input = Request::input('data');
      $user = Sentinel::getUser();
      $annotationSchemaExists = CoreferenceAnnotator::where('user_id', '=',  $user['id'])
                              ->get();

      if (!$annotationSchemaExists->count()){       //annotation schema does not exist -- save new annotation schema
        $newAnnotationSchema = CoreferenceAnnotator::create([  
          'user_id' => $user['id'],    
          'language' => $input['language'],          
          'annotation_type' => $input['annotation_type'],
          'alternative' => $input['alternative']
        ]);
      } else {                    //annotation schema exists -- update it        
        $newAnnotationSchema = CoreferenceAnnotator::where('user_id', '=',  $user['id'])->update([
          'language' => $input['language'],          
          'annotation_type' => $input['annotation_type'],
          'alternative' => $input['alternative']
        ]);
      } 
      }catch(\Exception $e){
        return Response::json(['success' => false, 'message' => $e->getMessage()]);
    }

    return Response::json(['success' => true]);
  }
}
