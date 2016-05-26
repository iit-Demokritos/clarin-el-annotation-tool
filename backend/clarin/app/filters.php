<?php

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/


Route::filter('collection_permissions', function($route) {
	$collection_id = Route::current()->getParameter('collection_id');
    $user = Sentry::getUser();
/*
	$hasAccess = DB::table('collections')
				   ->leftJoin('shared_collections', 'collections.id', '=', 'shared_collections.collection_id')
				   ->where(function($query) use ($user) {
		           		$query->where('collections.owner_id', '=', $user['id'])
		           			  ->orWhere(function($query) use ($user) {
					                $query->where('shared_collections.from', '=', $user['email'])
					                      ->where('shared_collections.confirmed', '=', 1);
					           	})
		           			  ->orWhere(function($query) use ($user) {
									$query->where('shared_collections.to', '=', $user['email'])
						   				  ->where('shared_collections.confirmed', '=', 1);
								});
		           	})
				   ->where('collections.id', $collection_id)
				   ->count();

	if ($hasAccess==0)				//if user has no access
		return Response::json(array('success' => false, 'message'	=> 'Authentication failed'), 401);*/
});


Route::filter('auth', function()
{
	if (!Sentry::check()) {
		if(Request::isJson()) {
			return Response::json(array('success' => false, 'message' => 'You should be connected to access this URL.'), 401);
		} else {
		    return View::make('index');
		}
	}
});


Route::filter('serviceCSRF',function(){
    if (Session::token() != Request::header('csrf_token')) {
    	return Response::json(array('success' => false, 'message' => 'I’m a teapot :D'), 418);
    }
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function()
{
	if (Session::token() != Input::get('_token'))
	{
		throw new Illuminate\Session\TokenMismatchException;
	}
});
