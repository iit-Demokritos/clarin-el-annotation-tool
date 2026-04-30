from clarin_backend.utils import ErrorLoggingAPIView

def custom_preprocessing_hook(endpoints):
    new_endpoints = []
    # your modifications to the list of operations that are exposed in the schema
    for (path, path_regex, method, callback) in endpoints:
        print(method, callback, path, path_regex)
        if issubclass(callback.view_class, ErrorLoggingAPIView):
            print("===================>", ErrorLoggingAPIView.method_mapping[method.lower()])
            new_endpoints.append((path, path_regex, ErrorLoggingAPIView.method_mapping.get(method.lower(), method), callback))
        else:
            new_endpoints.append((path, path_regex, method, callback))
    return endpoints
