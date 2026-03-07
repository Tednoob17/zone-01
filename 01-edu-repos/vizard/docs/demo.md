# DEMO

```python
import requests
import time
from datetime import datetime

def postRequest(link,headers,json):
  go = False
  while not go:
    try:
      res = requests.post(link,headers=headers,json=json)
      go = True
    except:
      print("sleep time post")
      time.sleep(60)
      go = False
  return res

def getRequest(link,params):
  go = False
  while not go:
    try:
      res = requests.get(link,params=params)
      go = True
    except:
      print("sleep time get")
      time.sleep(60)
      go = False
  return res

tokenRequest = getRequest(school_link+"/api/auth/token",params={"token":token})
bearerToken = tokenRequest.json()
headers = {"Authorization":"Bearer "+bearerToken,'Content-Type': 'application/json'}

query ={"query": '''
query get_data($ob_id: Int!){
  module_graph:object(where:{id:{_eq:$ob_id}}){
    graph:attrs(path:"graph")
  }

	project_path:object_child(where:{parentId:{_eq:$ob_id}}){
    object:child{
      name
    }
    path:key
  }

  module_project:object_child(where:{parentId:{_eq:$ob_id},child:{type:{_eq:"project"}}}){
    object:child{
      name
    }
    path:key
    mandatory:attrs(path:"mandatory")
  }
  module_piscine:object_child(where:{parentId:{_eq:$ob_id},child:{type:{_eq:"piscine"}}}){
    object:child{
      name
    }
    path:key
  }
  module_checkpoints:object_child(where:{parentId:{_eq:$ob_id},child:{type:{_eq:"exam"}}}){
    object:child{
      name
    }
    path:key
  }
}

''',
"variables":{
  "ob_id":[object_ID]
  }

}
```
```python
data = postRequest(school_link+"/api/graphql-engine/v1/graphql",headers=headers,json=query).json()['data']
```
```python
from circular_graph.modular_graph import modular_graph
from circular_graph.tools.text_conversion import to_slug
import pandas as pd
```
```python
project_slug_dict = {}
for project in data['project_path']:
  project_slug_dict[project['object']['name']]= project['path']
```
```python
piscines = []
for piscine in data['module_piscine']:
  piscines.append(piscine['object']['name'])
```
```python
checkpoints=[]
for checkpoint in data['module_checkpoints']:
  checkpoints.append(checkpoint['object']['name'])
```
```python
mandatory_projects = []
for mandatory in data['module_project']:
  if mandatory['mandatory']:
    mandatory_projects.append(mandatory['object']['name'])
```
```python
piscines_list = [to_slug(p, project_slug_dict) for p in list(pd.Series(piscines))]
checkpoints_list = [to_slug(c, project_slug_dict) for c in list(pd.Series(checkpoints))]
mandatory_list = [to_slug(p, project_slug_dict) for p in list(pd.Series(mandatory_projects))]
```
## Classic kind example
```python
from random import randrange
from IPython.lib.security import random
import json
graph_json = json.dumps(data['module_graph'][0]['graph'])
data_map = {}
for key in project_slug_dict:
  data_map[project_slug_dict[key]] = randrange(100)
#--------------------------------------------------------
g = modular_graph(
    graph_json,
    data_map,
    piscines_list,
    checkpoints_list,
    mandatory_list,
    kind="classic",  # or "distribution", default kind is set to classic
    g.show()
)
```
## Distribution kind example
```python
data_map = {}
for key in project_slug_dict:
  data_map[project_slug_dict[key]] = pd.Series({
        "upperfence":randrange(100),
        "lowerfence":randrange(100),
        "q1":randrange(100),
        "median":randrange(100),
        "q3":randrange(100),
        "min":randrange(100),
        "max":randrange(100),
        "outliers":randrange(100)
  })
#---------------------------------
g = modular_graph(
    graph_json,
    data_map,
    piscines_list,
    checkpoints_list,
    mandatory_list,
    kind="distribution",
)
g.show()
```