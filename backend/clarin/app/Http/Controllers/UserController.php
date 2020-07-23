<?php
//use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UserController extends \BaseController {


    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('auth:api', ['except' => ['login', 'gettoken']]);
    }

   /**
   * [GET] function that returns nothing. Just to get the CSRF token
   **/
   public function gettoken() {
     return Response::json(array('success' => true, 'data' => []), 200);
   }


    /**
   * [GET] function that returns statistics about the logged user
   **/
    public function index() {
        try {
            $user = Sentinel::getUser();
            $stats = array(
                'collections' => 0,
                'documents' => 0,
                'annotations' => 0
            );

            $stats['collections'] = Collection::where('owner_id', '=',  $user['id'])->count();
            $stats['documents'] = Document::where('owner_id', '=',  $user['id'])->count();
            $stats['annotations'] = Annotation::where('owner_id', $user['id'])->count();

            return Response::json(array('success' => true, 'data' => $stats), 200);
        }catch(\Exception $e){
            return Response::json(array('success' => false, 'message' => $e->getMessage()), 500);
        }
    }


    /**
   * [POST] function that updates user's password
   * @param {String} old_password
     * @param {String} new_password
   **/
    public function updatePassword() {
        try {
            $credentials =  array(
                'old_password' => Request::json('old_password'),
                'new_password' => Request::json('new_password')
            );

            $user = Sentinel::getUser();

            if (Sentinel::validateCredentials($user, ['password' => $credentials['old_password']])) {
		// $user->password = $credentials['new_password'];
		$user = Sentinel::update($user, ['password' => $credentials['new_password']]);

                if ($user->save()) {
                    return Response::json(array('success' => true, 'message' => 'You password was successfully updated.'), 200);
                } else {
                    return Response::json(array('success' => false, 'message' => 'An error was occured. Please try again.'), 500);
                }
            } else {
                return Response::json(array('success' => false, 'message' => 'Your current password doesn\'t match'), 400);
            }
        } catch (Exception $e) {
            return Response::json(array('success' => false, 'message' => $e->getMessage()), 500);
        }
    }


    /**
     * [POST] function that registers a new user
     * @param {String} name
     * @param {String} email
     * @param {String} password
     **/
    public function register() {
        try {
            $credentials = array(
                'name' => Request::json('name'),
                'email' => Request::json('email'),
                'password' => Request::json('password')
            );

            //register user using Sentry and generate activation code
            $user = Sentinel::register($credentials, false);
            //$activation_code = $user->getActivationCode();
      $activation = Activation::create($user);
            $activation_code = $activation['code'];

            //prepare the required variables passed to the email view
      $email_data = array(
    'id' => $activation['user_id'],
                'name' => $credentials['name'],
                'to' => $credentials['email'],
                'subject' => 'Welcome at Clarin-EL!',
                'activation_code' => $activation_code
            );

            //send an email to notify user to activate the account
            Mail::send('emails/activate-account', $email_data, function($message) use ($email_data){
                $message->to($email_data['to'])
                        ->subject($email_data['subject']);
            });

            return Response::json(array('success' => true, 'message' => 'You were successfully registered.'), 200);
        } catch (Exception $e) {
            return Response::json(array('success' => false, 'message' => $e->getMessage()), 500);
        }
    }


    /**
     * [GET] function that activates the account of a user
     * @param {String} email
     * @param {String} activation code
     **/
    public function activate_account() {
        try {
            $user_id = Request::input('userid');
            //$user_email = Request::input('email');
            $activation_code = Request::input('activation_code');

      // Find the user using the supplied email
            $user = Sentinel::findUserById($user_id);

      // Attempt to activate the user
      if (Activation::complete($user, $activation_code)) {
            //if ($user->attemptActivation($activation_code)) {
                return View::make('basic', array('message' => 'Your account has been successfully activated.'));
            } else {
                return View::make('basic', array('message' => 'An error was occured. Please try again.'));
            }
        } catch (Cartalyst\Sentinel\Users\UserNotFoundException $e) {
            return View::make('basic', array('message' => 'User was not found.'));
        } catch (Cartalyst\Sentinel\Users\UserAlreadyActivatedException $e) {
            return View::make('basic', array('message' => 'User is already activated.'));
        }
    }


    /**
     * [POST] function that logins a user
     * @param {String} email
     * @param {String} password
     **/
    public function login() {
      try {
        $credentials = array(
            'email' => Request::json('email'),
            'password' => Request::json('password')
	);
	//Log::info("Authenticate the user");
	//Log::info($credentials);

        // Authenticate the user
        $user = Sentinel::authenticate($credentials, true);
	// https://jwt-auth.readthedocs.io/en/develop/quick-start/
	if (! $token = JWTAuth::attempt($credentials)) {
          return response()->json(['success' => false, 'message' => 'Unauthorized'], HttpResponse::HTTP_UNAUTHORIZED);
        }
	$user['jwtToken'] = $token;
	
	//Log::info($user);
	//Log::info(json_encode(auth()));
	//Log::info(json_encode(auth()->user()));
        return Response::json(array('success' => true,   'data' => $user), 200);
      }
      catch (Cartalyst\Sentinel\Users\LoginRequiredException $e) {
        return Response::json(array('success' => false, 'message'  => 'Login field is required.'), 400);
      }
      catch (Cartalyst\Sentinel\Users\PasswordRequiredException $e) {
        return Response::json(array('success' => false, 'message'  => 'Password field is required.'), 400);
      }
      catch (Cartalyst\Sentinel\Users\WrongPasswordException $e) {
        return Response::json(array('success' => false, 'message'  => 'Wrong password, try again.'), 400);
      }
      catch (Cartalyst\Sentinel\Users\UserNotFoundException $e) {
        return Response::json(array('success' => false, 'message'  => 'User was not found.'), 400);
      }
      catch (Cartalyst\Sentinel\Users\UserNotActivatedException $e)  {
        return Response::json(array('success' => false, 'message'  => 'Authentication failed'), 400);
      }
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
      return response()->json(['success' => true, 'data' => auth()->user()]);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refreshToken()
    {
      $user = auth()->user();
      $user['jwtToken'] = auth()->refresh();
      return Response::json(array('success' => true,   'data' => $user), 200);
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }


    /**
     * [POST] function that resets the password of a user
     * @param {String} email
     **/
    public function reset() {
        try {
            $user_email = Request::json('email');

      //find the user from the supplied email and get a password reset code
      // todo: sentinel does not have such method?
            $user = Sentinel::findUserByLogin($user_email);
            $reset_code = $user->getResetPasswordCode();

            // Check if the reset password code is valid
            if ($user->checkResetPasswordCode($reset_code)) {

                // Attempt to reset the user password
                $new_password = Str::random(10);
                if ($user->attemptResetPassword($reset_code, $new_password)) {

                    //prepare the required variables passed to the email view
                    $email_data = array(
                        'name' => $user['name'],
                        'to' => $user['email'],
                        'subject' => '[Clarin-EL] Your password has been reset.',
                        'new_password' => $new_password
                    );

                    //send an email to notify the recepient for the password reset procedure
                    Mail::send('emails/reset-password', $email_data, function($message) use ($email_data){
                        $message->to($email_data['to'])
                                ->subject($email_data['subject']);
                    });

                    return Response::json(array(
                        'success' => false,
                        'message' => 'Your password reset was successful. An email with your new password will arrive shortly.'), 200);
                } else {
                    return Response::json(array('success' => false, 'message' => 'An error was occured. Please try again.'), 500);
                }
            } else {
                return Response::json(array('success' => false, 'message' => 'An error was occured. Please try again.'), 500);
            }
        } catch (Exception $e) {
            return Response::json(array('success' => false, 'message' => $e->getMessage()), 500);
        }
    }

    /**
     * [GET] function that logs out a user
     **/
    public function logout() {
      try {
        Sentinel::logout();
        auth()->logout();
        return Response::json(array('success' => true, 'message' => 'You successfully signed out.'), 200);
      } catch (Exception $e) {
          return Response::json(array('success' => false, 'message' => $e->getMessage()), 500);
      }
    }

}
