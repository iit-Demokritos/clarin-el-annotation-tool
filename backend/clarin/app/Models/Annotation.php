<?php

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class Annotation extends Eloquent /*Moloquent*/ {
	protected $connection = 'mongodb';
	protected $collection = 'annotations';
	protected $fillable = ['_id', 'document_id', 'collection_id', 'owner_id', 'annotator_id', 'type', 'spans', 'attributes', 'updated_by'];
}
