<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        <div style="max-width:450px; margin:0 auto 20px;">
            <img src="{{ $message->embed('images/logo.jpg') }}" style="margin: 0 auto; width: 170px; display: block;"/><br/><br/>
        	Hello {{$name}},<br/><br/>
            To finish signing up for your Clarin-EL account, you must click the link below to confirm your email address.<br/><br/>

            <div style="padding: 19px; border: 1px solid #e3e3e3;background-color: #f5f5f5;max-width: 400px; ">
                <a href="{{ URL::to('auth/activate?email=' . $to . '&activation_code=' . $activation_code) }}"
                style="color: #fff;background-color: #337ab7;border-color: #2e6da4;display: block;
                padding: 10px 16px;font-size: 18px;line-height: 1.3333333;border-radius: 4px;
                text-decoration: none;text-align: center;">Activate your account</a>
            </div><br/>

            After that, you will be able to sign in to Clarin-EL and explore its awesome features.<br/><br/>
            Thank you, <br/>
            The Clarin-EL Team.
        </div>
    </body>
</html>
