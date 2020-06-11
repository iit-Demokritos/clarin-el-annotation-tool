<?php

class UserController extends \BaseController {

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
                'old_password' => Input::json('old_password'),
                'new_password' => Input::json('new_password')
            );

            $user = Sentinel::getUser();

            if($user->checkPassword($credentials['old_password'])) {
                $user->password = $credentials['new_password'];

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
                'name' => Input::json('name'),
                'email' => Input::json('email'),
                'password' => Input::json('password')
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
            $user_id = Input::get('userid');
            //$user_email = Input::get('email');
            $activation_code = Input::get('activation_code');

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
		        'email' => Input::json('email'),
		        'password' => Input::json('password')
		    );

		    // Authenticate the user
		    $user = Sentinel::authenticate($credentials, true);
		    return Response::json(array('success' => true, 	'data' => $user), 200);
		}
		catch (Cartalyst\Sentinel\Users\LoginRequiredException $e) {
		    return Response::json(array('success' => false, 'message'	=> 'Login field is required.'), 400);
		}
		catch (Cartalyst\Sentinel\Users\PasswordRequiredException $e) {
		    return Response::json(array('success' => false, 'message'	=> 'Password field is required.'), 400);
		}
		catch (Cartalyst\Sentinel\Users\WrongPasswordException $e) {
		    return Response::json(array('success' => false, 'message'	=> 'Wrong password, try again.'), 400);
		}
		catch (Cartalyst\Sentinel\Users\UserNotFoundException $e) {
		    return Response::json(array('success' => false, 'message'	=> 'User was not found.'), 400);
		}
		catch (Cartalyst\Sentinel\Users\UserNotActivatedException $e)	{
		    return Response::json(array('success' => false, 'message'	=> 'Authentication failed'), 400);
		}
  	}


    /**
     * [POST] function that resets the password of a user
     * @param {String} email
     **/
    public function reset() {
        try {
            $user_email = Input::json('email');

	    //find the user from the supplied email and get a password reset code
	    // todo: sentinel does not have such method?
            $user = Sentinel::findUserByLogin($user_email);
            $reset_code = $user->getResetPasswordCode();

            // Check if the reset password code is valid
            if ($user->checkResetPasswordCode($reset_code)) {

                // Attempt to reset the user password
                $new_password = str_random(10);
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
	    	return Response::json(array('success' => true, 'message' => 'You successfully signed out.'), 200);
	    } catch (Exception $e) {
	        return Response::json(array('success' => false, 'message' => $e->getMessage()), 500);
	    }
  	}
}
