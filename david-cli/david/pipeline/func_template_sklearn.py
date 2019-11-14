import pickle
import json
import pandas as pd


model_path = "{{ the_model_path }}"
model = pickle.load(open(model_path, "rb"))
# e.g : model = pickle.load("/share/XXXXX/share/finalized_model.sav")


def handler(request, response):
    result = "FaaS accept http request, you can send GET and POST request to the end point!"
    if request.method == 'POST':
        if request.content_type != 'application/json':
            result = '{} JSON data expected, not {}'.format(result, request.content_type)
            response.mimetype='text/plain'
        else:
            records = pd.read_json(request.data.decode("utf-8"), orient="records")
            predictions = model.predict(records[list(records)[0]].tolist())
            result = json.dumps({"predictions": predictions.tolist()})
            response.mimetype='application/json'
    response.set_data("{}".format(result))

