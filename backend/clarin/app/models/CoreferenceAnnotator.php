<?php

class CoreferenceAnnotator extends Eloquent {
	protected $table = 'coreference_annotators';
	protected $fillable = array('user_id', 'language', 'annotation_type', 'alternative'); 
}