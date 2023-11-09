import { Collection, SharedCollectionsInformation } from '@models/collection';
import { Document } from '@models/document';
import { Annotation } from '@models/annotation';

export interface BackendResult<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BackendResultArray<T> {
  success: boolean;
  data: [T];
  message?: string;
}

export interface BackendResultSharedCollectionsInformation {
  shared_by_me:           SharedCollectionsInformation,
  shared_with_me:         SharedCollectionsInformation,
  shared_by_me_pending:   SharedCollectionsInformation,
  shared_with_me_pending: SharedCollectionsInformation,
}

export interface BackendResultAnnotatioVisualisationData {
  collection: Collection,
  document:   Document,
  annotation: Annotation,
}
