<?php

namespace App\Http\Middleware;

use Closure;

use JWTAuth;
use Exception;
use Tymon\JWTAuth\Http\Middleware\BaseMiddleware;

use Illuminate\Support\Facades\Log;

// From:
// https://www.medianova.com/en-blog/2020/01/17/laravel-api-jwt-examples

class JwtMiddleware extends BaseMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
      try {
        //Log::info("JwtMiddleware: =========================================");
        $user = JWTAuth::parseToken()->authenticate();
        //Log::info($user);
        //Log::info("========================================================");
        if ( !$user ) throw new Exception('User Not Found');
      } catch (Exception $e) {
        //Log::error($e);
        if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenInvalidException){
          return response()->json([
            'data' => null,
            'status' => false,
            'err_' => [
              'message' => 'Token Invalid',
              'code' => 1
            ]
          ]);
        } else if ($e instanceof \Tymon\JWTAuth\Exceptions\TokenExpiredException){
          return response()->json([
            'data' => null,
            'status' => false,
            'err_' => [
              'message' => 'Token Expired',
              'code' =>1
            ]
          ]);
        } else {
          if ($e->getMessage() === 'User Not Found') {
            return response()->json([
              "data" => null,
              "status" => false,
              "err_" => [
                "message" => "User Not Found",
                "code" => 1
              ]
            ]);
          }
          return response()->json([
            'data' => null,
            'status' => false,
            'err_' => [
              'message' => 'Authorization Token not found',
              'code' =>1
            ]
          ]);
        }
      }
      return $next($request);
    }
}
