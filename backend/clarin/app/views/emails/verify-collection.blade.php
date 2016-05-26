<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <div style="max-width:450px; margin:0 auto 20px;">
            <img src="{{ $message->embed('images/logo.jpg') }}" style="margin: 0 auto; width: 170px; display: block;"/><br/><br/>
        	Hello {{$recepient_name}},<br/><br/>
            We would like to inform you that user {{$from}} wants to share the collection "{{$collection_name}}" with you!
            Please follow the link below to accept the invitation.<br/><br/>

            <div style="padding: 19px; border: 1px solid #e3e3e3;background-color: #f5f5f5;max-width: 400px; ">
                <a href="{{ URL::to('api/collections/'. $collection_id . '/share_verify/' . $confirmation_code) }}"
                style="color: #fff;background-color: #337ab7;border-color: #2e6da4;display: block;
                padding: 10px 16px;font-size: 18px;line-height: 1.3333333;border-radius: 4px;
                text-decoration: none;text-align: center;">Accept the invitation</a>
            </div><br/>

            After that, you will be able to modify this collection.<br/><br/>
            Thank you, <br/>
            The Clarin-EL Team.
        </div>
    </body>
</html>
