<?php

class ButtonAnnotator extends Eloquent {
	protected $table = 'button_annotators';
	protected $fillable = ['user_id', 'language', 'annotation_type', 'attribute', 'alternative']; 
}