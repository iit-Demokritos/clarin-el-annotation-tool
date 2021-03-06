<!DOCTYPE html>
<html>
	<head>
		<title>Clarin-EL</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="shortcut icon" href="{{ asset('favicon.ico') }}">

		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
		<style media="screen">
			.login-logo { margin-top: 100px; }
			.bg-info {
				max-width: 320px;
				word-wrap: break-word;
				padding:20px 20px 30px;
				margin:15px auto 15px;
				-webkit-border-radius: 5px;
				-moz-border-radius: 5px;
				border-radius: 5px;
			}
		</style>
	</head>
    <body>
		<div class="container">
			<div class="row">
				<div class="col-md-4 col-md-offset-4 text-center">
					<div class="row"><img class="login-logo" src="<?php echo url('images/logo.jpg') ?>"/></div>
					<div class=" row bg-info">
						<p><?php echo $message; ?></p>
						<a class="btn btn-primary center" href="<?php echo url('') ?>">Return to Clarin-EL</a>
					</div>
				</div>
			</div>
		</div>
    </body>
</html>
