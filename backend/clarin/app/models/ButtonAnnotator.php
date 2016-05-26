<?php

class ButtonAnnotator extends Eloquent {
	protected $table = 'button_annotators';
	protected $fillable = array('user_id', 'language', 'annotation_type', 'attribute', 'alternative'); 
}