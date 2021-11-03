import simplejwt as simplejwt
from django.urls import path, re_path
from rest_framework_simplejwt import views as jwt_views
from .views import GetCsrfToken, OpenDocumentRetrieve, ResetPassword, ChangePassword, ShareCollectionView, SharedCollectionDelete, \
    AcceptCollectionView, OpenDocumentView, CollectionDataView, ButtonAnnotatorView, CoreferenceAnnotatorView, \
    SaveTempAnnotationView, OpenDocumentUpdate, HandleTempAnnotationView, DocumenAnnotationView, DeleteSavedAnnotations, \
    ExportCollectionView, ReturnStatistics, HandleCollection, HandleCollections, HandleDocuments, HandleDocument, \
    InitPasswords, Me, ExistCollection, ImportAnnotationsView,OpenDocumentRetrieve
from .views import ObtainTokenPairView, \
    CustomUserCreate, \
    MainView, \
    LogoutAndBlacklistRefreshTokenForUserView, \
    ActivationView,InitApp,HandlerApply

from django.contrib.staticfiles.views import serve

urlpatterns = [
    path('auth/activate/<uidb64>/<token>', ActivationView.as_view(),                            name='user_activate'),
    path('auth/login',                     ObtainTokenPairView.as_view(),                       name='login_auth'),
    path('auth/reset_all',                 InitPasswords.as_view(),                             name="auth_reset_all"),
    path('auth/token/obtain',              ObtainTokenPairView.as_view(),                       name='auth_token_obtain'),
    path('auth/token/refresh',             jwt_views.TokenRefreshView.as_view(),                name='auth_token_refresh'),
    path('api/auth/register',              CustomUserCreate.as_view(),                          name="auth_register"),
    path('api/auth/gettoken',              GetCsrfToken.as_view(),                              name='csrf_token_get'),
    path('api/auth/login',                 ObtainTokenPairView.as_view(),                       name="auth_login"),
    path('api/auth/reset',                 ResetPassword.as_view(),                             name='auth_reset'),
    path('api/user/logout',                LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='api_user_logout'),
    path('api/user/me',                    Me.as_view(),                                        name='api_user_me'),
    path('api/user/refresh-token',         jwt_views.TokenRefreshView.as_view(),                name='api_user_token_refresh'),
    path('api/user/update',                ChangePassword.as_view(),                            name='api_user_update'),
    path('api/user',                       ReturnStatistics.as_view(),                          name='api_user'),
    path('api/collections/<collection_id>/export', ExportCollectionView.as_view(), name='api_collection_export'),
    path('api/collections/exists/<collection_name>', ExistCollection.as_view(), name='api_collection_exist'),
    path('api/collections/<collection_id>/documents/<document_id>/annotations/import', ImportAnnotationsView.as_view(), name='api_collection_import_annotations'),
    path('api/collections/<collection_id>',HandleCollection.as_view(), name='api_collection_rename'),
    path('api/collections', HandleCollections.as_view(), name='api_collections'),
    path('api/collections/<collection_id>/documents',HandleDocuments.as_view(), name='api_collection_documents'),
    path('api/collections/<collection_id>/documents/<document_id>',HandleDocument.as_view(), name='current_document'),
    path('api/fileoperation/handler/apply/',HandlerApply.as_view(),name='apply_tei_handler'),
    path('api/collections/<collection_id>/share',ShareCollectionView.as_view(), name='api_collection_share'),
    path('api/collections/<collection_id>/share/<share_id>',SharedCollectionDelete.as_view(), name='api_collection_share_cancel'),
    path('api/collections/<collection_id>/share_verify/<uidb64>/<usidb64>/<upidb64>/<token>', AcceptCollectionView.as_view(), name='api_collection_share_verify'),
    path('api/open_documents', OpenDocumentView.as_view(), name='open_documents'),
    path('api/collections_data', CollectionDataView.as_view(), name='collections_data'),
    path('api/button_annotators', ButtonAnnotatorView.as_view(), name='button_annotators'),
    path('api/coreference_annotators', CoreferenceAnnotatorView.as_view(), name='coreference_annotators'),
    path('api/collections/<collection_id>/documents/<document_id>/temp_annotations', SaveTempAnnotationView.as_view(), name='temp_annotation'),
    path('api/collections/<collection_id>/documents/<document_id>/temp_annotations/<param>', HandleTempAnnotationView.as_view(), name='handle_annotation'),
    path('api/open_documents/<document_id>/<Button_Annotator_name>', OpenDocumentUpdate.as_view(), name='save_annotations1'),
    path('api/open_documents/<document_id>', OpenDocumentRetrieve.as_view(), name='open_document_retrieve'),
    path('api/collections/<collection_id>/documents/<document_id>/annotations/<Button_Annotator_name>', DeleteSavedAnnotations.as_view(), name='del_annotations'),
    path('api/collections/<collection_id>/documents/<document_id>/annotations', DocumenAnnotationView.as_view(), name='document_annotations'),
    path('main/',                          MainView.as_view(),                     name='main'),
    re_path('.*', InitApp.as_view(), name='any_path_index_view'),
]
