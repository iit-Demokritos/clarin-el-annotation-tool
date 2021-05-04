<?php

class AnnotationSchema extends Eloquent {
	protected $table = 'annotation_schemas';
	protected $fillable = ['xml', 'owner_id']; 
}