<?php

class CoreferenceAnnotator extends Eloquent {
	protected $table = 'coreference_annotators';
	protected $fillable = ['user_id', 'language', 'annotation_type', 'alternative']; 
}