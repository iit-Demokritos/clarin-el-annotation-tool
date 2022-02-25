from datetime import datetime

from django.utils.http import urlsafe_base64_encode
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Users, Collections, Documents, OpenDocuments, SharedCollections, ButtonAnnotators, \
    CoreferenceAnnotators
from .send_email import EmailAlert
from django.utils.encoding import force_bytes, force_text
from .utils import account_activation_token
from django.urls import reverse

from django.middleware.csrf import get_token


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        return token

    def validate(self, attrs):
        message="Authentication failed: "
        #print(self.context['request'].build_absolute_uri("/")[:-1])
        request=self.context['request']
        try:
            data = super().validate(attrs)
        except Exception as e:
            message=message+str(e)
            print(attrs)
            userr=Users.objects.filter(email=attrs["email"])
            if (userr.exists()):
                 user=userr.get()
                 check=user.check_password(attrs["password"])
                 if (check==False):
                     return {"success": False, "message": "No active account with these credentials"}
                 else:
                     uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                     token = account_activation_token.make_token(user)
                     link = reverse('user_activate', kwargs={'uidb64': uidb64, 'token': token})
                    # base_url="https://www.ellogon.org/"
                     base_url = request.build_absolute_uri("/")[:-1]
                     activation_link = request.build_absolute_uri(link)
                     #ellogon_path=request.build_absolute_uri('/static/images/EllogonLogo.svg')
                     ellogon_path="https://vast.ellogon.org/images/logo.jpg"
                    
                     if (user.first_name!=None and user.last_name!=None):
                                user_ref = user.first_name + " " + user.last_name
                     else:
                                user_ref=user.email
                     content = {"user":  user_ref, "link": activation_link,"email": attrs['email'],
                                "baseurl": base_url,
                                 "ellogon_logo": ellogon_path}  # path?
                     try:
                                activation_alert = EmailAlert(attrs['email'], user_ref, content)
                                activation_alert.send_activation_email()
                     except Exception as e:
                         return {"success": False,"message": "An error occured. email has not been sent"}





                     return {"success": False,"message": "The account  with these credentials has not been activated.Please look your email"}
                # print(check)
                 #r = requests.post(request.build_absolute_uri(reverse('auth_token_obtain')),
                                 #  data=data)
                 #if (r.status_code == 200):



            return {"success":False,"message":message}


        #refresh = self.get_token(self.user)
        self.user.last_login=datetime.now()
        self.user.save()

        data["success"] = True
        data["data"] = {}
        data["data"]["jwtToken"]={}
        data["data"]["jwtToken"]['refresh'] = data['refresh'];#str(refresh)
        data["data"]["jwtToken"]['access']  = data['access'];#str(refresh.access_token)

        # Add extra responses here
        data["data"]['id'] = self.user.pk
        data["data"]["first_name"] = self.user.first_name
        data["data"]["last_name"] = self.user.last_name
        data["data"]["email"] = self.user.email
        data["data"]["created_at"] = self.user.created_at
        data["data"]["updated_at"] = self.user.updated_at
        data["data"]["permissions"] = self.user.permissions
        data["data"]['last_login'] = self.user.last_login
        #print("b")
        return data


# ...
class CustomUserSerializer(serializers.ModelSerializer):
    """
    Currently unused in preference of the below.
    """
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(max_length=255, allow_null=True, default=None)
    last_name = serializers.CharField(max_length=255, allow_null=True, default=None)
    # created_at = serializers.DateTimeField(default=datetime.now)
    # updated_at = serializers.DateTimeField(default=datetime.now)
    # last_login = serializers.DateTimeField(allow_null=True, default=None)
    password = serializers.CharField(min_length=8, write_only=True, required=True)

    # permissions = serializers.CharField()

    class Meta:
        model = Users
        fields = ('email', 'first_name','last_name','username','password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        if password is not None:
            instance.set_password(password)
        instance.is_active = False
        instance.save()
        # Send confirmation mail

        # activation_alert=EmailAlert(instance.email,instance.username)
        # activation_alert.send_activation_email()
        return instance



class CollectionsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=255)
    encoding = serializers.CharField(max_length=255)
    handler = serializers.CharField(max_length=255)
    created_at = serializers.DateTimeField(default=datetime.now)
    updated_at = serializers.DateTimeField(default=datetime.now)
    owner_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())

    class Meta:
        model = Collections
        fields = ('name', 'encoding', 'handler',"created_at","updated_at","owner_id")

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        instance.save()
        return instance


class DocumentsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=255)
    external_name = serializers.CharField(max_length=255)
    text = serializers.CharField()
    type = serializers.CharField(max_length=128, allow_null=True, default=None)
    data_text = serializers.CharField(allow_null=True, default=None)
    #data_binary = serializers.BinaryField(allow_null=True, default=None)
    visualisation_options = serializers.CharField(allow_null=True, default=None)
    metadata = serializers.CharField(allow_null=True, default=None)
    encoding = serializers.CharField(max_length=20)
    handler = serializers.CharField(max_length=256, allow_null=True, default=None)
    created_at = serializers.DateTimeField(default=datetime.now)
    updated_at = serializers.DateTimeField(default=datetime.now)
    version = serializers.IntegerField(default=1)
    updated_by = serializers.CharField(max_length=255)
    owner_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())
    collection_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Collections.objects.all())

    class Meta:
        model = Documents
        fields =('name','external_name',"text","type","data_text","metadata","created_at",
                 "version","visualisation_options","encoding","handler","updated_by","updated_at","owner_id","collection_id")

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        instance.length = len(instance.text)  # as long as the fields are the same, we can just use this

        instance.save()
        return instance


class OpenDocumentsSerializer(serializers.ModelSerializer):
    #created_at = serializers.DateTimeField(default=datetime.now)
    updated_at = serializers.DateTimeField(default=datetime.now)
    db_interactions = serializers.IntegerField()
    annotator_type = serializers.CharField(max_length=255)
    user_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())
    collection_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Collections.objects.all())
    document_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Documents.objects.all())

    class Meta:
        model = OpenDocuments
        fields =("updated_at","db_interactions","annotator_type","user_id","collection_id","document_id")

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        instance.save()
        return instance


class SharedCollectionsSerializer(serializers.ModelSerializer):
    confirmed = serializers.IntegerField(default=0)  #SmallIntegerField model
    confirmation_code = serializers.CharField(max_length=255, allow_null=True, default=None)
    #created_at = serializers.DateTimeField(default=datetime.now)
    updated_at = serializers.DateTimeField(default=datetime.now)
    collection_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Collections.objects.all())
    fromfield= serializers.SlugRelatedField(many=False,read_only=False,slug_field='email',queryset=Users.objects.all())
    tofield= serializers.SlugRelatedField(many=False,read_only=False,slug_field='email',queryset=Users.objects.all())
    #fromfield = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())
    #tofield = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())

    class Meta:
        model = SharedCollections
        fields = ("confirmed","confirmation_code","updated_at","collection_id","fromfield","tofield")

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        instance.save()
        return instance


class ButtonAnnotatorsSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())
    language = serializers.CharField(max_length=255, allow_null=True, default=None)
    annotation_type = serializers.CharField(max_length=255, allow_null=True, default=None)
    attribute = serializers.CharField(max_length=255, allow_null=True, default=None)
    alternative = serializers.CharField(max_length=255, allow_null=True, default=None)
    #created_at = serializers.DateTimeField(default=datetime.now)
    updated_at = serializers.DateTimeField(default=datetime.now)

    class Meta:
        model = ButtonAnnotators
        fields = ("user_id","language","annotation_type","attribute","alternative","updated_at")

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        instance.save()
        return instance


class CoreferenceAnnotatorsSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Users.objects.all())
    language = serializers.CharField(max_length=255, allow_null=True, default=None)
    annotation_type = serializers.CharField(max_length=255, allow_null=True, default=None)
    alternative = serializers.CharField(max_length=255, allow_null=True, default=None)
    #created_at = serializers.DateTimeField(default=datetime.now)
    updated_at = serializers.DateTimeField(default=datetime.now)

    class Meta:
        model = CoreferenceAnnotators
        fields = ("user_id","language","annotation_type","alternative","updated_at")

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)  # as long as the fields are the same, we can just use this
        instance.save()
        return instance
