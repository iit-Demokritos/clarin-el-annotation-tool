<?php

class SharedCollectionController extends \BaseController {

  //get invitation's data
  public function index($collection_id) {
    try {
      $user = Sentinel::getUser();
      return Response::json(array(
                  'success' => true,
                  'data'    => SharedCollection::where('from', $user['email'])
                                 ->where('collection_id', $collection_id)
                                 ->get(array('id', 'collection_id', 'to', 'confirmed'))));
    }catch(\Exception $e){
        return Response::json(array('success' => false, 'message' => $e->getMessage()));
    }
  }

  //save a new shared collection invitation
  public function store() {
    try {
      $input = Request::input('data');
      $user = Sentinel::getUser();

      if(strcmp(trim($user['email']), trim($input['to']))==0)
        return Response::json(array('success' => false, 'message' => 'You cannot share a collection with yourself.'));

      //$recepient = Sentry::findUserByLogin($input['to']);  //attempt to find the recepient in the database
      $recepient = Sentinel::findByCredentials(['login' => $input['to']]);

      $confirmation_code = str_random(30);      //create a random string to complete the collection sharing request
      $data = array(
        'sender_name' => $user['name'],
        'recepient_name' => $recepient['name'],
        'to' => $input['to'],
        'from' => $user['email'],
        'subject' => '[Clarin-EL] User '. $user['email'] . ' wants to share a collection with you!',
        'collection_id' => $input['cid'],
        'collection_name' => $input['cname'],
        'confirmation_code' => $confirmation_code
      );

      $invitationExists = DB::table('shared_collections')
                  ->where('from', '=',  trim($data['from']))
                  ->where('to', '=',  trim($data['to']))
                  ->where('collection_id', '=',  $data['collection_id'])
                  ->pluck('confirmed');

      if (is_null($invitationExists)){                   //invitation does not exist -- add new invitation
        $checkIfOwner = Collection::where('owner_id', $user['id'])    //check if the user is the owner of the collection
                        ->where('id', $input['cid'])
                        ->first();

        if (is_null($checkIfOwner))                    //if the user is not the owner stop the execution and inform user
          return Response::json(array('success' => false, 'message' => 'You cannot share a collection that you do not own.'));

        SharedCollection::create(array(                  //insert a new record about the specific collection sharing
          'collection_id' => $data['collection_id'],
          'from' => $data['from'],
          'to' => $data['to'],
          'confirmation_code' => $data['confirmation_code']
        ));
      } else {                              //invitation exists
        if ($invitationExists==1)                    //if invitation is accepted, notify user that collection is already shared with the specific user.
          return Response::json(array('success' => false, 'message' => 'You already share this collection with the specific user.'));

        SharedCollection::where('from', '=',  trim($data['from']))        //if invitation is not confirmed, reset the confirmation code
                ->where('to', '=',  trim($data['to']))
                ->where('collection_id', '=',  $data['collection_id'])
                ->update(array('confirmation_code' => $data['confirmation_code']));
      }

      Mail::send('emails/verify-collection', $data, function($message) use ($data){          //send an email to notify the recepient for the shared collection request
              $message->to($data['to'])
                    ->subject('[Clarin-EL] ' . $data['sender_name'] . ' wants to share a collection with you!');
          });
      }catch(\Exception $e){
        return Response::json(array('success' => false, 'message' => $e->getMessage()));
    }

    return Response::json(array('success' => true));
  }


  //destroy a shared collection
  public function destroy($collection_id, $share_id) {
    try {
      $user = Sentinel::getUser();
      $shared_collection = SharedCollection::find((int) $share_id);
      //$invited_user = Sentry::findUserByLogin($shared_collection['to']);
      $invited_user = Sentinel::findByCredentials(['login' => $shared_collection['to']]);

      OpenDocument::where('user_id', '=', $invited_user['id'])
            ->where('collection_id', '=', (int) $collection_id)
            ->delete();

      SharedCollection::where('from', $user['email'])                //delete sharing only if the user owns the specific collection
              ->where('collection_id', '=', (int) $collection_id)
              ->where('id', '=', (int) $share_id)
              ->delete();
    }catch(\Exception $e){
        return Response::json(array('success' => false, 'message' => $e->getMessage()));
    }

    return Response::json(array('success' => true));
  }


  //confirm a shared collection's invitation
  public function confirm($collection_id, $confirmation_code) {
    try {
          $invitationConfirmed = SharedCollection::where('confirmation_code', '=', $confirmation_code)->pluck('confirmed');

      if (is_null($invitationConfirmed))                           //invitation does not exist -- add new invitation
        return View::make('basic', array('message' => 'The requested invitation does not exist!'));
      else {
        if ($invitationConfirmed==1)                          //if invitation is accepted, notify user that collection is already shared with the specific user.
          return View::make('basic', array('message' => 'The requested invitation has already been accepted!'));
          //return Response::json(array('success' => false, 'message' => 'The requested invitation has already been accepted!'));
        else {
          SharedCollection::where('collection_id', '=',  $collection_id)        //if invitation is not confirmed, reset the confirmation code
                  ->where('confirmation_code', '=',  $confirmation_code)
                  ->update(array('confirmed' => 1));
        }
      }
        } catch(\Exception $e){
          return View::make('basic', array('message' => $e->getMessage()));
    }

    return View::make('basic', array('message' => 'You have successfully accepted the invitation! Start the annotation!'));
  }
}
