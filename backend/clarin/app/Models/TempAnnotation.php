<?php

//use Jenssegers\Mongodb\Eloquent\SoftDeletingTrait;
//use Illuminate\Database\Eloquent\SoftDeletes;
use Jenssegers\Mongodb\Eloquent\SoftDeletes;

use Jenssegers\Mongodb\Eloquent\Model as Eloquent;

class TempAnnotation extends Eloquent /*Moloquent*/ {
    //use SoftDeletingTrait;
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'annotations_temp';
    protected $dates = ['deleted_at'];
    protected $fillable = array('_id', 'document_id', 'collection_id', 'owner_id', 'type', 'spans', 'attributes', 'updated_by'); 
}
