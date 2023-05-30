from vast_repository import RDFStoreVAST
rdf = RDFStoreVAST()
rdf.retrieveAndSerialiseCollections()

exit(0)

# https://github.com/patzomir/graphdb-python-api
#import graphdb.graphdb_workbench
#from graphdb.graphdb_workbench.rest import ApiException
#from pprint import pprint

#from graphdb.graphdb_workbench.configuration import Configuration
#from graphdb.graphdb_workbench.api_client import ApiClient
from graphdb.rdf4j.configuration import Configuration
from graphdb.rdf4j.api_client import ApiClient


configuration = Configuration()
configuration.host = ""
# Username for HTTP basic authentication
configuration.username = ""
# Password for HTTP basic authentication
configuration.password = ""
configuration.debug = True
print(configuration.get_basic_auth_token())
api = ApiClient(configuration=configuration)
# Call user login...
_, _, headers = api.call_api(f"/rest/login/{configuration.username}", "POST", header_params={'X-GraphDB-Password':configuration.password})
print(">>>>>>>>>>>>>>>>>>>>>", headers["Authorization"])
#print(r.getheader("Authorization"))
#pprint(r)
#exit(0)

#api.set_default_header("Authorization", configuration.get_basic_auth_token())
api.set_default_header("Authorization", headers["Authorization"])
api.set_default_header("Content-Type", "application/x-www-form-urlencoded")


## UPDATE
import graphdb.rdf4j
from graphdb.rdf4j.rest import ApiException
from pprint import pprint



# create an instance of the API class
api_instance = graphdb.rdf4j.SparqlApi(api_client=api)
repository_id = 'VAST-Test' # str | The repository ID
update = xml # str | Only relevant for POST operations. Specifies the SPARQL 1.1 Update string to be executed. The value is expected to be a syntactically valid SPARQL 1.1 Update string. (optional)
base_uri = api.configuration.host # str | Specifies the base URI to resolve any relative URIs found in uploaded data against. This parameter only applies to the PUT and POST method. (optional)

try:
    # Performs updates on the data in the repository
    api_instance.update(repository_id, update=update)
except ApiException as e:
    print("Exception when calling SparqlApi->update: %s\n" % e)

exit(0)
# create an instance of the API class
api_instance = graphdb.graphdb_workbench.ImportControllerApi(api_client=api)
api_instance.api_client.set_default_header("Authorization", headers["Authorization"])
pprint(dir(api_instance.api_client))
print(api_instance.api_client.default_headers)
import_body = graphdb.graphdb_workbench.ServerImportBody() # ServerImportBody | importBody
repository_id = 'VAST-Test' # str | repositoryID

try:
    # Get server files available for import
    api_response = api_instance.list_server_files_using_get(repository_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ImportControllerApi->list_server_files_using_get: %s\n" % e)

exit(0)

try:
    # Import a server file into the repository
    api_response = api_instance.import_server_file_using_post(import_body, repository_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ImportControllerApi->import_server_file_using_post: %s\n" % e)
