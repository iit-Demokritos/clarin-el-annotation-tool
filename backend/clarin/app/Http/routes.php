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

Route::get('/', function () {
    //return view('welcome');
    return View::make('index');
});

Route::get('/welcome', function() {
	return View::make('index');
});

Route::group(array('prefix' => 'auth'), function() {
	Route::post('register', array('uses' => 'UserController@register'));
	Route::get('activate', array('uses' => 'UserController@activate_account'));
	Route::post('reset', array('uses' => 'UserController@reset'));

	Route::post('login', array('before' => 'csrf_json', 'uses' => 'UserController@login'));
	Route::get('logout', 'UserController@logout');
});

Route::get('api/collections/{collection_id}/export', 'CollectionController@exportData');

Route::group(array('prefix' => 'api', 'before' => 'auth'), function() {
	Route::resource('user', 'UserController', array('only' => array('index')));
	Route::post('user/update', 'UserController@updatePassword');

	Route::resource('collections', 'CollectionController', array('only' => array('index', 'show', 'store', 'update', 'destroy')));
	Route::get('collections_data/', 'CollectionController@showData');
	Route::resource('collections/{collection_id}/share', 'SharedCollectionController', array('only' => array('index','store', 'destroy')));
	Route::get('collections/{collection_id}/share_verify/{confirmation_code}', 'SharedCollectionController@confirm');

	Route::resource('collections/{collection_id}/documents', 'DocumentController', array('only' => array('index', 'show', 'store', 'destroy')));
	Route::get('collections/{collection_id}/documents/{document_id}/live', 'TempAnnotationController@liveUpdate');
	Route::resource('open_documents', 'OpenDocumentController', array('only' => array('index', 'show', 'store', 'destroy')));

	Route::resource('collections/{collection_id}/documents/{document_id}/annotations', 'AnnotationController', array('only' => array('index','show','store', 'destroy')));
	Route::resource('collections/{collection_id}/documents/{document_id}/temp_annotations', 'TempAnnotationController', array('only' => array('index','show','store', 'update', 'destroy')));

	Route::resource('button_annotators', 'ButtonAnnotatorController', array('only' => array('index', 'store')));
	Route::resource('coreference_annotators', 'CoreferenceAnnotatorController', array('only' => array('index', 'store')));
	Route::resource('annotation_schemas', 'AnnotationSchemaController', array('only' => array('index', 'show', 'store', 'destroy')));	//ellogon will use api for the database ? if not, remove destroy and (maybe) index
});

//App::missing(function($exception) {
//	return View::make('index');
//});
