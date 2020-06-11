<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <div style="max-width:450px; margin:0 auto 20px;">
            <img src="{{ $message->embed('images/logo.jpg') }}" style="margin: 0 auto; width: 170px; display: block;"/><br/><br/>
        	Hello {{$name}},<br/><br/>
            The password for your Clarin-EL account has been successfully reset.
            You will find your new password below.<br/><br/>

            <div style="padding: 19px; border: 1px solid #e3e3e3;background-color: #f5f5f5;max-width: 400px; ">
                <div style="color: #fff;background-color: #337ab7;border-color: #2e6da4;display: block;
                padding: 10px 16px;font-size: 18px;line-height: 1.3333333;border-radius: 4px;
                text-decoration: none;text-align: center;">{{$new_password}}</div>
            </div><br/>

            We strongly recommend that you update your account's password from the user profile section
            of the Clarin-EL website.<br/><br/>

            Thank you, <br/>
            The Clarin-EL Team.
        </div>
    </body>
</html>
