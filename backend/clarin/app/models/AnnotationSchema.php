<?php

class AnnotationSchema extends Eloquent {
	protected $table = 'annotation_schemas';
	protected $fillable = array('xml', 'owner_id'); 
}