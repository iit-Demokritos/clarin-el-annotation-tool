import simplejwt as simplejwt
from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import GetCsrfToken, OpenDocumentRetrieve, ResetPassword, ChangePassword, ManageProfileView, ShareCollectionView, SharedCollectionDelete, \
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
    path('', InitApp.as_view(), name='login_auth'),
    path('api/auth/gettoken',GetCsrfToken.as_view(),name='csrf_token_get'),
    path('auth/login',InitApp.as_view(),name='login_auth'),
    path('api/auth/register',                   CustomUserCreate.as_view(),             name="auth_register"),

    path('auth/activate/<uidb64>/<token>', ActivationView.as_view(),               name='user_activate'),
    path('api/auth/login',                    ObtainTokenPairView.as_view(),                    name="auth_login"),
    path('user/profile_manage',           ManageProfileView.as_view(),            name='user_profile'),
    path('api/auth/reset',                    ResetPassword.as_view(),                name='auth_reset'),
    path('api/user/update',                ChangePassword.as_view(),               name='api_user_update'),
    path('api/user/logout',                   LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='auth_logout'),
    path('auth/token/obtain',             ObtainTokenPairView.as_view(),          name='auth_token_obtain'),
    path('auth/token/refresh',            jwt_views.TokenRefreshView.as_view(),   name='auth_token_refresh'),
    path('auth/reset_all',InitPasswords.as_view(),name="auth_reset_all"),



    path('main/',                          MainView.as_view(),                     name='main'),
    #1)return statistics: {"success":true,"data":{"collections":1,"documents":4,"annotations":11}} } - pass param user_name
    path('api/user/me', Me.as_view(), name='api_user_me'),
    path('api/user',                            ReturnStatistics.as_view(),                     name='api_user'),




    #export collections with their documents and their annotations
    #get
    path('api/collections/<collection_id>/export', ExportCollectionView.as_view(), name='api_collection_export'),
    path('api/collections/exists/<collection_name>', ExistCollection.as_view(), name='api_collection_exist'),
   # path('api/collections/import', ImportCollectionView.as_view(), name='api_collection_import'),
    path('api/collections/<collection_id>/documents/<document_id>/annotations/import', ImportAnnotationsView.as_view(), name='api_collection_import_annotations'),
    #2)rename collection
    #patch
    #input:{"data":{"id":38,"name":"ddfgfhfhf"}}
    #{"success":true,"exists":true,"flash":"The name you selected already exists. Please select a new name"} -output

    #3)delete collection
    # output {success:true}



    path('api/collections/<collection_id>',HandleCollection.as_view(), name='api_collection_rename'),

#4)return collections get
   # {"success":true,"data":[{"id":38,"name":"Lorem_ipsum","encoding":"UTF-8","owner_id":50,"confirmed":null,"document_count":4,"is_owner":1},{"id":44,"name":"Collection1","encoding":"UTF-8","owner_id":58,"confirmed":1,"document_count":4,"is_owner":0}]}

 #5)add collection  post
 #input"{"data":{"name":"Intro","encoding":"Unicode","handler":{"name":"No Handler","value":"none"},"overwrite":false}}
#output:{"success":true,"collection_id":73,"exists":false}
    #rename-overwrite?

    path('api/collections', HandleCollections.as_view(), name='api_collections'),







# 6)   retunr documents of selected collection
    #     #success	true
# data
# 0
# id	2952
# name	"text2.txt"
# type	null
# text	"Ce descendons admiration…a rumeur au folles en. "
# data_text	null
# data_binary	null
# handler	null
# visualisation_options	null
# metadata	null
# external_name	"text2.txt"
# encoding	"UTF-8"
# version	1
# owner_id	58
# collection_id	44
# updated_by	"granna_93@yahoo.gr"
# created_at	"2021-03-10 09:11:06"
# updated_at	"2021-03-10 09:11:06"
# owner_email	"granna_93@yahoo.gr"
# 1	{…}
# 2	{…}
# 3	{…}
#get

#7)add document
#input:"data":{"name":"sport1.txt","type":"Text","text":"Νεότερες πληροφορίες από το μέτωπο Μπρούμα αναφέρουν ότι η Αϊντχόφεν έχει δεχθεί ήδη δύο κρούσεις από ομάδες του εξωτερικού για τον 26χρονο ποδοσφαιριστή. Το θέμα δυσκολεύει ακόμη περισσότερο κι επειδή τα χρήματα που έχει λαμβάνειν είναι πολλά (1.850.000 € ανά σεζόν), αλλά κι επειδή η ολλανδική ομάδα δεν “καίγεται” να τον πουλήσει. Μπορεί να τον επανεντάξει στο ρόστερ της έστω και ως εναλλακτική επιλογή, αν κι όπως φαίνεται δεν θα δυσκολευθεί ιδιαίτερα να βρει τον επόμενο σταθμό της καριέρας του.\n","collection_id":38,"external_name":"sport1.txt","encoding":"UTF-8","handler":{"name":"No Handler","value":"none"}}}
    #output:success:true
#post
    path('api/collections/<collection_id>/documents',HandleDocuments.as_view(), name='api_collection_documents'),







#8)delete document
#succces:true ->output
#delete


#9)get the document
#success	true
# data	Object { id: 3066, name: "DOC 23.txt", type: "text", … } id	3066   name	"DOC 23.txt"  type	"text" text "sadfkjaslfdjldskf" data_text	null
# data_binary	null
# handler	"none"
# visualisation_options	null
# metadata	null
# external_name	"DOC 23.txt"
# encoding	"UTF-8"
# version	1
# owner_id	58
# collection_id	48
# updated_by	"granna_93@yahoo.gr"
# created_at	"2021-05-14T09:56:58.000000Z"
# updated_at	"2021-05-14T09:56:58.000000Z"
# is_opened	false




path('api/collections/<collection_id>/documents/<document_id>',HandleDocument.as_view(), name='current_document'),
path('api/fileoperation/handler/apply/',HandlerApply.as_view(),name='apply_tei_handler'),
#10)share project-sender
    #post
#input:{"data":{"cname":"Lorem_ipsum","cid":38,"to":"antogramatzis@outlook.com"}}
#success:true->output

 #11)get
 #ouput:{"success":true,"data":[{"id":48,"collection_id":38,"to":"antogramatzis@outlook.com","confirmed":0}]}

path('api/collections/<collection_id>/share',ShareCollectionView.as_view(), name='api_collection_share'),
 #delete -cancel invitation
path('api/collections/<collection_id>/share/<share_id>',SharedCollectionDelete.as_view(), name='api_collection_share_cancel'),




#12)get
    #html:1)You have successfully accepted the invitation! Start the annotation! 2)The requested invitation has already been accepted!
    path('api/collections/<collection_id>/share_verify/<uidb64>/<usidb64>/<upidb64>/<token>', AcceptCollectionView.as_view(), name='api_collection_share_verify'),


#13)get open documents
    #output
#{"success":true,"data":[{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":32,"document_id":207,"annotator_type":"Button_Annotator_neutral_argument_type_Generic","db_interactions":16,"confirmed":1,"opened":0},{"collection_id":53,"document_id":3007,"annotator_type":"Coreference_Annotator_neutral_aspect+polarity_Games","db_interactions":0,"confirmed":null,"opened":0},{"collection_id":48,"document_id":2961,"annotator_type":"Coreference_Annotator_greek_argument_Mandenaki","db_interactions":0,"confirmed":null,"opened":0},{"collection_id":66,"document_id":3044,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":0,"opened":0},{"collection_id":66,"document_id":3044,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":0,"opened":0},{"collection_id":66,"document_id":3044,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":0,"opened":0},{"collection_id":70,"document_id":3062,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":1,"opened":0},{"collection_id":70,"document_id":3062,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":0,"opened":0},{"collection_id":72,"document_id":3061,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":null,"opened":0},{"collection_id":71,"document_id":3060,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":3,"confirmed":null,"opened":0},{"collection_id":58,"document_id":3019,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":null,"opened":0},{"collection_id":65,"document_id":3034,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":1,"opened":0},{"collection_id":65,"document_id":3034,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":0,"opened":0},{"collection_id":65,"document_id":3034,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":1,"opened":0},{"collection_id":57,"document_id":3018,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic","db_interactions":0,"confirmed":1,"opened":0}]}


#14)post open document
   # input:{"data":{"document_id":2957,"collection_id":38,"annotator_type":"Button_Annotator_neutral_VAST_value_type_Generic"}}
    #success:true->output

path('api/open_documents', OpenDocumentView.as_view(), name='open_documents'),


#15)get collections data(documents of collections)
    #output
#{"success":true,"data":[{"id":3014,"name":"DOC 23.txt","collection_id":44,"collection_name":"Collection1","owner_id":58,"confirmed":1,"is_owner":0},{"id":2953,"name":"text1.txt","collection_id":44,"collection_name":"Collection1","owner_id":58,"confirmed":1,"is_owner":0},{"id":2952,"name":"text2.txt","collection_id":44,"collection_name":"Collection1","owner_id":58,"confirmed":1,"is_owner":0},{"id":2959,"name":"text3.txt","collection_id":44,"collection_name":"Collection1","owner_id":58,"confirmed":1,"is_owner":0},{"id":3071,"name":"document1.txt","collection_id":74,"collection_name":"Intro","owner_id":50,"confirmed":null,"is_owner":1},{"id":3070,"name":"document2.txt","collection_id":74,"collection_name":"Intro","owner_id":50,"confirmed":null,"is_owner":1},{"id":2957,"name":"arthroefsyn.txt","collection_id":38,"collection_name":"Lorem_ipsum","owner_id":50,"confirmed":1,"is_owner":1},{"id":2922,"name":"lorem_ipsum.txt","collection_id":38,"collection_name":"Lorem_ipsum","owner_id":50,"confirmed":1,"is_owner":1},{"id":2951,"name":"RetrofitClient.txt","collection_id":38,"collection_name":"Lorem_ipsum","owner_id":50,"confirmed":1,"is_owner":1},{"id":2931,"name":"Sample Article 1.txt","collection_id":38,"collection_name":"Lorem_ipsum","owner_id":50,"confirmed":1,"is_owner":1}]}

path('api/collections_data', CollectionDataView.as_view(), name='collections_data'),

#16)get button annotators

#{"success":true,"data":{"language":"neutral","annotation_type":"VAST_value","attribute":"type","alternative":"Generic"}}

#17)post button annotator
#{"data":{"language":"neutral","annotation_type":"VAST_value","attribute":"type","alternative":"Generic"}}
#success:true-> output

path('api/button_annotators', ButtonAnnotatorView.as_view(), name='button_annotators'),

#18)get coreference annotators
#{"success":true,"data":{"language":"greek","annotation_type":"argument","alternative":"Mandenaki"}}

#19)post coreference annotators
#{"data":{"language":"neutral","annotation_type":"aspect+polarity","alternative":"Games","attribute":""}}
#output:{"success":true}
path('api/coreference_annotators', CoreferenceAnnotatorView.as_view(), name='coreference_annotators'),





#button annotator - onclick
#POST new annotation
# request data	{…}
# _id	"60a0de13d8a4740584179fd2"
# annotator_id	"Button_Annotator_neutral_VAST_value_type_Generic"
# attributes	[…]
# 0
# name	"type"
# value	"dialogue"
# collection_id	48
# document_id	3066
# spans	[…]
# 0	{…}
# end	1608
# segment	"He immediate sometimes or to dependent in"
# start	1567
# type	"VAST_value"
#Response success	true
path('api/collections/<collection_id>/documents/<document_id>/temp_annotations', SaveTempAnnotationView.as_view(), name='temp_annotation'),

#edit annotation
#PUT
# data	{…}
# _id	"60a0de13d8a4740584179fd2"
# annotator_id	"Button_Annotator_neutral_VAST_value_type_Generic"
# attributes	[…]
# 0
# name	"type"
# value	"gratitude_vs_ingratitude"
# collection_id	48
# document_id	3066
# spans	[…]
# 0	{…}
# end	1608
# segment	"He immediate sometimes or to dependent in"
# start	1567
# type	"VAST_value"
#<param>-> id

#GET
# success	true
# data	[ {…}, {…}, {…} ]
# 0	Object { _id: "60a0ddb7d8a4740584179fd1", document_id: 3066, collection_id: 48, … }
# _id	"60a0ddb7d8a4740584179fd1"
# document_id	3066
# collection_id	48
# annotator_id	"Button_Annotator_neutral_VAST_value_type_Generic"
# type	"VAST_value"
# spans	[ {…} ]
# 0	Object { segment: "wishing", start: 744, end: 751 }
# segment	"wishing"
# start	744
# end	751
# attributes	[ {…} ]
# 0
# name	"type"
# value	"female_emancipation_and_autonomy"
#<param>-> annotator_name

#DELETE ANNOTATION
#Delete
#param->id



path('api/collections/<collection_id>/documents/<document_id>/temp_annotations/<param>', HandleTempAnnotationView.as_view(), name='handle_annotation'),

#SAVE ANNOTATIONS

#GET
# success	true
# data	[ {…} ]
# 0	Object { collection_id: 48, document_id: 3066, annotator_type: "Button_Annotator_neutral_VAST_value_type_Generic", … }
# collection_id	48
# document_id	3066
# annotator_type	"Button_Annotator_neutral_VAST_value_type_Generic"
# db_interactions	4 --- gia db_interactions> 0 kanei ta parakatw
# confirmed	null
# opened	1
#<button_annotator_name>->Button_Annotator_<language>_<annotation_type>_<attribute>_<alternative>
path('api/open_documents/<document_id>/<Button_Annotator_name>', OpenDocumentUpdate.as_view(), name='save_annotations1'),
path('api/open_documents/<document_id>', OpenDocumentRetrieve.as_view(), name='open_document_retrieve'),


#DELETE
#<button_annotator_name>->Button_Annotator_<language>_<annotation_type>_<attribute>_<alternative>
path('api/collections/<collection_id>/documents/<document_id>/annotations/<Button_Annotator_name>', DeleteSavedAnnotations.as_view(), name='del_annotations'),


#POST
# data	[…]
# 0	{…}
# _id	"60a0ddb7d8a4740584179fd1"
# annotator_id	"Button_Annotator_neutral_VAST_value_type_Generic"
# attributes	[…]
# 0
# name	"type"
# value	"female_emancipation_and_autonomy"
# collection_id	48
# document_id	3066
# spans	[…]
# 0	{…}
# end	751
# segment	"wishing"
# start	744
# type	"VAST_value"
#kathe fora kanei save ola ta annotations tou document oxi mono ta kainouria

#get annotations
#{"success":true,"data":[{"_id":"6076c659fd8f6db30f7c84aa","document_id":2957,"collection_id":38,"annotator_id":"Button_Annotator_greek_token_pos_HBrill","type":"token","spans":[{"segment":"\u03af\u03c7\u03b5 \u03b4\u03b5\u03c3\u03bc\u03b5\u03c5\u03c4\u03b5\u03af \u03b1\u03bd\u03b1\u03bc\u03ad\u03bd\u03b5\u03c4\u03b1\u03b9 \u03bd\u03b1 \u03c0\u03b1\u03c1","start":40,"end":71}],"attributes":[{"name":"pos","value":"JJSM"}]},{"_id":"6076c65bfd8f6db30f7c84ab","document_id":2957,"collection_id":38,"annotator_id":"Button_Annotator_greek_token_pos_HBrill","type":"token","spans":[{"segment":"\u03c2. \u039f\u03c0\u03c9\u03c2 \u03b5\u03be\u03ae\u03b3\u03b7\u03c3\u03b5, \u03b7 \u039a\u03bf\u03bc\u03b9\u03c3\u03b9\u03cc","start":456,"end":482}],"attributes":[{"name":"pos","value":"INP"}]}]}

#get annotations of the opened document
#success	true
# data	[ {…} ]
# 0	Object { _id: "60a0ddb7d8a4740584179fd1", document_id: 3066, collection_id: 48, … }
# _id	"60a0ddb7d8a4740584179fd1"
# document_id	3066
# collection_id	48
# annotator_id	"Button_Annotator_neutral_VAST_value_type_Generic"
# type	"VAST_value"
# spans	[ {…} ]
# 0	Object { segment: "wishing", start: 744, end: 751 }
# segment	"wishing"
# start	744
# end	751
# attributes	[ {…} ]
# 0
# name	"type"
# value	"female_emancipation_and_autonomy"




path('api/collections/<collection_id>/documents/<document_id>/annotations', DocumenAnnotationView.as_view(), name='document_annotations'),

]
