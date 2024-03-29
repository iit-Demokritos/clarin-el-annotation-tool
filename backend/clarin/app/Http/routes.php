<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::domain('vast.ellogon.org')->group(function () {
  Route::get('/', function () {
    return View::make('angular2_index');
  });
  Route::get('/welcome', function() {
    return View::make('angular2_index');
  });
});

Route::get('/', function () {
  //return view('welcome');
  return View::make('index');
});

Route::get('/welcome', function() {
  return View::make('index');
});

Route::group(['prefix' => 'auth'], function() {
  Route::post('register',  ['uses' => 'UserController@register']);
  Route::get ('activate',  ['uses' => 'UserController@activate_account']);
  Route::post('reset',     ['uses' => 'UserController@reset']);
  
  Route::post('login',     ['before' => ['csrf_json'], 'uses' => 'UserController@login']);
  Route::get ('gettoken',  'UserController@gettoken');
});

Route::group(['prefix' => 'api/auth'], function() {
  Route::post('register',  ['uses' => 'UserController@register']);
  Route::get ('activate',  ['uses' => 'UserController@activate_account']);
  Route::post('reset',     ['uses' => 'UserController@reset']);
  
  Route::post('login',     ['before' => ['csrf_json'], 'uses' => 'UserController@login']);
  Route::get ('gettoken',  'UserController@gettoken');
});

Route::get('api/collections/{collection_id}/export', 'CollectionController@exportData');

Route::group([/*'middleware' => 'jwt.verify' <= uncomment to enable JWT ,*/ 'prefix' => 'api', 'before' => 'auth'], function() {
        Route::resource('user',               'UserController', ['only' => ['index']]);
        Route::post(    'user/update',        'UserController@updatePassword');
        Route::post(    'user/refresh-token', ['before' => ['csrf_json'], 'uses' => 'UserController@refreshToken']);
        Route::get(     'user/me',            'UserController@me');
        Route::get(     'user/logout',        'UserController@logout');

        Route::resource('collections', 'CollectionController', ['only' => ['index', 'show', 'store', 'update', 'destroy']]);
        Route::get('collections_data/', 'CollectionController@showData');
        Route::resource('collections/{collection_id}/share', 'SharedCollectionController', ['only' => ['index', 'store', 'destroy']]);
        Route::get('collections/{collection_id}/share_verify/{confirmation_code}', 'SharedCollectionController@confirm');

        Route::resource('collections/{collection_id}/documents', 'DocumentController', ['only' => ['index', 'show', 'store', 'destroy']]);
        Route::get('collections/{collection_id}/documents/{document_id}/live', 'TempAnnotationController@liveUpdate');
        Route::get('open_documents/{document_id}/{annotator_id}', 'OpenDocumentController@show');
        Route::delete('open_documents/{document_id}/{annotator_id}', 'OpenDocumentController@destroy');
        Route::resource('open_documents', 'OpenDocumentController', ['only' => ['index', 'show', 'store', 'destroy']]);

        Route::resource('collections/{collection_id}/documents/{document_id}/annotations', 'AnnotationController', ['only' => ['index', 'show', 'store', 'destroy']]);
        Route::resource('collections/{collection_id}/documents/{document_id}/temp_annotations', 'TempAnnotationController', ['only' => ['index', 'show','store', 'update', 'destroy']]);

        Route::resource('button_annotators', 'ButtonAnnotatorController', ['only' => ['index', 'store']]);
        Route::resource('coreference_annotators', 'CoreferenceAnnotatorController', ['only' => ['index', 'store']]);
        Route::resource('annotation_schemas', 'AnnotationSchemaController', ['only' => ['index', 'show', 'store', 'destroy']]);        //ellogon will use api for the database ? if not, remove destroy and (maybe) index

        /* Collection Import */
        Route::post('collections/import', 'CollectionController@importData');
        Route::post('collections/{collection_id}/documents/{document_id}/annotations/import', 'AnnotationController@import');
        Route::get('collections/exists/{collection_name}', 'CollectionController@exists');

});

#Route::get('/teststream', 'TestStreamController@test');

Route::domain('vast.ellogon.org')->group(function () {
  Route::any('{catchall}', function() {
    return View::make('angular2_index');
  })->where('catchall', '.*');
});
Route::any('{catchall}', function() {
  return View::make('index');
})->where('catchall', '.*');
