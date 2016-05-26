<?php

use Jenssegers\Mongodb\Eloquent\SoftDeletingTrait;
	
class TempAnnotation extends Moloquent {
	use SoftDeletingTrait;

	protected $connection = 'mongodb';
    protected $collection = 'annotations_temp';
    protected $dates = ['deleted_at'];
	protected $fillable = array('_id', 'document_id', 'collection_id', 'owner_id', 'type', 'spans', 'attributes', 'updated_by'); 
}