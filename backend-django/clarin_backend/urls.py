import simplejwt as simplejwt
from django.urls import path, re_path
from rest_framework_simplejwt import views as jwt_views
from .views import GetCsrfToken, OpenDocumentRetrieve, ResetPassword, ChangePassword, ShareCollectionView, SharedCollectionDelete, \
    AcceptCollectionView, OpenDocumentView, CollectionDataView, ButtonAnnotatorView, CoreferenceAnnotatorView, \
    OpenDocumentUpdate, \
    ExportCollectionView, ReturnStatistics, HandleCollection, HandleCollections,  \
    InitPasswords, Me, ExistCollection, ImportAnnotationsView,OpenDocumentRetrieve
from .views import ObtainTokenPairView, \
    CustomUserCreate, \
    MainView, \
    LogoutAndBlacklistRefreshTokenForUserView, \
    ActivationView,InitApp,HandlerApply, \
    DocumentLiveUpdate,RefreshTokenView,ImportView, \
    TestEmailSendView, \
    UserAuthenticated

from .mongodb_views import *
from .sql_views import *

from django.contrib.staticfiles.views import serve

urlpatterns = [
    path('auth/activate/<uidb64>/<token>',                                                              ActivationView.as_view(),                            name='user_activate'),
    path('auth/login',                                                                                  ObtainTokenPairView.as_view(),                       name='login_auth'),
    path('auth/loginsocial',                                                                            ObtainTokenPairView.as_view(),                       name='login_social_auth'),
    path('auth/register',                                                                               CustomUserCreate.as_view(),                          name="auth_register"),
    path('auth/reset',                                                                                  ResetPassword.as_view(),                             name='auth_reset'),
    #path('auth/reset_all',                                                                              InitPasswords.as_view(),                             name="auth_reset_all"),
    path('auth/token/obtain',                                                                           ObtainTokenPairView.as_view(),                       name='auth_token_obtain'),
    path('auth/token/refresh',                                                                          RefreshTokenView.as_view(),                          name='auth_token_refresh'),
  # path('auth/token/refresh',                                                                          jwt_views.TokenRefreshView.as_view(),                name='auth_token_refresh'),
    path('api/auth/register',                                                                           CustomUserCreate.as_view(),                          name="auth_register"),
    path('api/auth/gettoken',                                                                           GetCsrfToken.as_view(),                              name='csrf_token_get'),
    path('api/auth/login',                                                                              ObtainTokenPairView.as_view(),                       name="auth_login"),
    path('api/auth/reset',                                                                              ResetPassword.as_view(),                             name='auth_reset'),
    path('api/user/logout',                                                                             LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='api_user_logout'),
    path('api/user/me',                                                                                 Me.as_view(),                                        name='api_user_me'),
    path('api/user/refresh-token',                                                                      RefreshTokenView.as_view(),                          name='api_user_token_refresh'),
  # path('api/user/refresh-token',                                                                      jwt_views.TokenRefreshView.as_view(),                name='api_user_token_refresh'),
    path('api/user/update',                                                                             ChangePassword.as_view(),                            name='api_user_update'),
    path('api/user/authenticated',                                                                      UserAuthenticated.as_view(),                         name='api_user_authenticated'),
    path('api/user',                                                                                    ReturnStatistics.as_view(),                          name='api_user'),
    path('api/collections/<int:collection_id>/export',                                                  ExportCollectionView.as_view(),                      name='api_collection_export'),
    path('api/collections/exists/<str:collection_name>',                                                ExistCollection.as_view(),                           name='api_collection_exist'),
    path('api/collections/import',                                                                      ImportView.as_view(),                                name='api_collection_import'),
    path('api/collections/<int:collection_id>/documents/<int:document_id>/annotations/import',          ImportAnnotationsView.as_view(),                     name='api_collection_import_annotations'),
    path('api/collections/<int:collection_id>/documents/<int:document_id>/live',                        DocumentLiveUpdate.as_view(),                        name='document_live_update'),
    path('api/collections/<int:collection_id>',                                                         HandleCollection.as_view(),                          name='api_collection_rename'),
    path('api/collections',                                                                             HandleCollections.as_view(),                         name='api_collections'),
    #path('api/collections/<collection_id>/documents',                                                  HandleDocuments.as_view(),                           name='api_collection_documents'),
    path('api/collections/<int:cid>/documents/<int:did>',                                               DocumentsViewDetail.as_view(),                       name='current_document'),
    path('api/collections/<int:cid>/documents',                                                         DocumentsViewList.as_view(),                         name='api_collection_documents'),
    path('api/fileoperation/handler/apply/',                                                            HandlerApply.as_view(),                              name='apply_tei_handler'),
    path('api/collections/<int:collection_id>/share',                                                   ShareCollectionView.as_view(),                       name='api_collection_share'),
    path('api/collections/<int:collection_id>/share/<int:share_id>',                                    SharedCollectionDelete.as_view(),                    name='api_collection_share_cancel'),
    path('api/collections/<int:collection_id>/share_verify/<uidb64>/<usidb64>/<upidb64>/<token>',       AcceptCollectionView.as_view(),                      name='api_collection_share_verify'),
    path('api/open_documents',                                                                          OpenDocumentView.as_view(),                          name='open_documents'),
    path('api/open_documents/<int:document_id>/<str:Button_Annotator_name>',                            OpenDocumentUpdate.as_view(),                        name='save_annotations1'),
    path('api/open_documents/<int:document_id>',                                                        OpenDocumentRetrieve.as_view(),                      name='open_document_retrieve'),
    path('api/collections_data',                                                                        CollectionDataView.as_view(),                        name='collections_data'),
    path('api/button_annotators',                                                                       ButtonAnnotatorView.as_view(),                       name='button_annotators'),
    path('api/coreference_annotators',                                                                  CoreferenceAnnotatorView.as_view(),                  name='coreference_annotators'),
    ## Old MongoDB API...
    # path('api/collections/<collection_id>/documents/<document_id>/temp_annotations/<param>',            HandleTempAnnotationView.as_view(),                  name='handle_annotation'),
    # path('api/collections/<collection_id>/documents/<document_id>/temp_annotations',                    SaveTempAnnotationView.as_view(),                    name='temp_annotation'),
    # path('api/collections/<collection_id>/documents/<document_id>/annotations/<Button_Annotator_name>', DeleteSavedAnnotations.as_view(),                    name='del_annotations'),
    # path('api/collections/<collection_id>/documents/<document_id>/annotations',                         DocumenAnnotationView.as_view(),                     name='document_annotations'),
    ## Test New MongoDB API...
    path('api/collections/<int:cid>/documents/<int:did>/annotations/<str:Button_Annotator_name>',       AnnotationsViewDetail.as_view(),                     name='del_annotations'),
    path('api/collections/<int:cid>/documents/<int:did>/annotations',                                   AnnotationsViewList.as_view(),                       name='document_annotations'),
    path('api/collections/<int:cid>/documents/<int:did>/temp_annotations/<str:param>',                  TempAnnotationsViewDetail.as_view(),                 name='handle_annotation'),
    path('api/collections/<int:cid>/documents/<int:did>/temp_annotations',                              TempAnnotationsViewList.as_view(),                   name='temp_annotation'),

    #path('api/test/collections/<int:cid>/documents',                                                    DocumentsViewList.as_view(),                         name='api_test_collection_documents'),
    #path('api/test/collections/<int:cid>/documents/<int:did>',                                          DocumentsViewDetail.as_view(),                       name='current_document'),
    #path('api/test/email/send',                                                                         TestEmailSendView.as_view(),                         name='test_email_send'),

    #path('main/',                                                                                       MainView.as_view(),                                  name='main'),
    re_path('.*',                                                                                       InitApp.as_view(),                                   name='any_path_index_view'),
]
