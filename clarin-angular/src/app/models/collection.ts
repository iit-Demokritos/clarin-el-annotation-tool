export var CollectionNamePattern: string = "[a-zA-Z0-9]+[\\\-a-zA-Z0-9_ ,'\\\(\\\)\\\.]+";

export interface Collection {
  confirmed?: any | null;
  document_count?: number;
  encoding: string;
  handler: string;
  id: number;
  is_owner?: boolean;
  name: string;
  owner_id?: number;
}

export interface SharedCollectionInformation {
  id:                number;
  confirmed:         boolean;
  created_at:        string;
  updated_at:        string;
  collection_id:     number;
  collection_name:   string;
  from_email:        string;
  to_email:          string;
  confirmation_code: string;
}

export interface SharedCollectionsInformation extends Array<SharedCollectionInformation>{}
